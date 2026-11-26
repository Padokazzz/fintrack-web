use reqwest::{header, redirect::Policy, Client, Method, Url};
use serde::{Deserialize, Serialize};
use std::{io, time::Duration};

pub const MAX_BODY: usize = 16 * 1024 * 1024;

pub struct Api {
    origin: Url,
    client: Client,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiRequest {
    method: String,
    path: String,
    body: Option<String>,
    authorization: Option<String>,
    session_request: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiResponse {
    status: u16,
    content_type: String,
    bytes: Vec<u8>,
}

impl Api {
    pub fn new(value: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let origin = Url::parse(value)?;
        let loopback = matches!(origin.host_str(), Some("localhost" | "127.0.0.1" | "[::1]"));
        if origin.host_str().is_none()
            || !(origin.scheme() == "https" || (origin.scheme() == "http" && loopback))
            || origin.path() != "/"
            || !origin.username().is_empty()
            || origin.password().is_some()
            || origin.query().is_some()
            || origin.fragment().is_some()
        {
            return Err(io::Error::new(
                io::ErrorKind::InvalidInput,
                "Use an HTTPS API origin or local loopback HTTP.",
            )
            .into());
        }

        let client = Client::builder()
            .cookie_store(true)
            .redirect(Policy::none())
            .timeout(Duration::from_secs(20))
            .build()?;

        Ok(Self { origin, client })
    }

    fn url(&self, path: &str) -> Result<Url, String> {
        if !path.starts_with("/api/") || path.contains('\\') {
            return Err("Invalid API route.".into());
        }
        let url = self.origin.join(path).map_err(|_| "Invalid API route.")?;
        if url.origin() != self.origin.origin()
            || !url.path().starts_with("/api/")
            || url.fragment().is_some()
        {
            return Err("Invalid API route.".into());
        }
        Ok(url)
    }

    async fn send(&self, request: ApiRequest) -> Result<ApiResponse, String> {
        let url = self.url(&request.path)?;
        let method = match request.method.as_str() {
            "GET" => Method::GET,
            "POST" => Method::POST,
            "PUT" => Method::PUT,
            "PATCH" => Method::PATCH,
            "DELETE" => Method::DELETE,
            _ => return Err("Unsupported API method.".into()),
        };
        let mut outgoing = self.client.request(method, url);
        if let Some(body) = request.body {
            outgoing = outgoing
                .header(header::CONTENT_TYPE, "application/json")
                .body(body);
        }
        if let Some(authorization) = request.authorization {
            outgoing = outgoing.header(header::AUTHORIZATION, authorization);
        }
        if request.session_request {
            outgoing = outgoing.header("X-FinTrack-Session", "1");
        }

        let mut response = outgoing
            .send()
            .await
            .map_err(|_| "Could not reach the FinTrack API.")?;
        let status = response.status().as_u16();
        let content_type = response
            .headers()
            .get(header::CONTENT_TYPE)
            .and_then(|value| value.to_str().ok())
            .unwrap_or("")
            .to_owned();
        let mut bytes = Vec::new();
        while let Some(chunk) = response
            .chunk()
            .await
            .map_err(|_| "Could not read the API response.")?
        {
            if bytes.len() + chunk.len() > MAX_BODY {
                return Err("The API response is too large.".into());
            }
            bytes.extend_from_slice(&chunk);
        }

        Ok(ApiResponse {
            status,
            content_type,
            bytes,
        })
    }
}

#[tauri::command]
pub async fn api_request(
    api: tauri::State<'_, Api>,
    request: ApiRequest,
) -> Result<ApiResponse, String> {
    api.send(request).await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn confines_requests_to_the_configured_api() {
        let api = Api::new("http://127.0.0.1:8080").unwrap();
        assert_eq!(
            api.url("/api/accounts?page=2").unwrap().query(),
            Some("page=2")
        );
        for path in [
            "//example.com/api/accounts",
            "/api/../admin",
            "/api/%2e%2e/admin",
            "/api/accounts#anchor",
        ] {
            assert!(api.url(path).is_err(), "{path}");
        }
        assert!(Api::new("http://example.com").is_err());
        assert!(Api::new("https://example.com/custom").is_err());
        assert!(Api::new("https://example.com").is_ok());
    }

    #[test]
    #[ignore = "requires disposable FinTrack API and PostgreSQL"]
    fn refresh_and_export_against_fintrack_api() {
        use serde_json::{json, Value};
        use std::time::{SystemTime, UNIX_EPOCH};

        tauri::async_runtime::block_on(async {
            let origin =
                std::env::var("FINTRACK_DESKTOP_TEST_API_URL").expect("Set the disposable API URL");
            let api = Api::new(&origin).unwrap();
            let timestamp = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_nanos();
            let credentials = json!({
                "name": "FinTrack Desktop Test",
                "email": format!("desktop-{timestamp}@example.com"),
                "password": format!("desktop-test-{timestamp}")
            });

            let send =
                |method: &str, path: &str, body: Option<Value>, authorization: Option<String>| {
                    api.send(ApiRequest {
                        method: method.to_owned(),
                        path: path.to_owned(),
                        body: body.map(|value| value.to_string()),
                        authorization,
                        session_request: path == "/api/auth/refresh" || path == "/api/auth/logout",
                    })
                };

            assert_eq!(
                send(
                    "POST",
                    "/api/auth/register",
                    Some(credentials.clone()),
                    None
                )
                .await
                .unwrap()
                .status,
                200
            );
            assert_eq!(
                send("POST", "/api/auth/login", Some(credentials), None)
                    .await
                    .unwrap()
                    .status,
                200
            );
            let refresh = send("POST", "/api/auth/refresh", None, None).await.unwrap();
            assert_eq!(refresh.status, 200);
            let auth: Value = serde_json::from_slice(&refresh.bytes).unwrap();
            let bearer = format!("Bearer {}", auth["token"].as_str().unwrap());

            let accounts = send("GET", "/api/accounts", None, Some(bearer.clone()))
                .await
                .unwrap();
            assert_eq!(accounts.status, 200);
            let report = send(
                "GET",
                "/api/reports/transactions.csv?month=11&year=2026",
                None,
                Some(bearer),
            )
            .await
            .unwrap();
            assert_eq!(report.status, 200);
            assert!(report.content_type.starts_with("text/csv"));
            assert!(String::from_utf8(report.bytes)
                .unwrap()
                .contains("date,description,account,category,type,amount"));

            assert_eq!(
                send("POST", "/api/auth/logout", None, None)
                    .await
                    .unwrap()
                    .status,
                204
            );
            assert_eq!(
                send("POST", "/api/auth/refresh", None, None)
                    .await
                    .unwrap()
                    .status,
                401
            );
        });
    }
}
