use tauri::Manager;

mod transport;

#[cfg(not(any(target_os = "android", target_os = "ios")))]
#[tauri::command]
async fn save_csv(
    app: tauri::AppHandle,
    year: u16,
    month: u8,
    bytes: Vec<u8>,
) -> Result<bool, String> {
    use tauri_plugin_dialog::DialogExt;

    if !(2000..=2100).contains(&year)
        || !(1..=12).contains(&month)
        || bytes.len() > transport::MAX_BODY
    {
        return Err("Invalid report.".into());
    }

    let Some(destination) = app
        .dialog()
        .file()
        .set_file_name(format!("fintrack-{year:04}-{month:02}.csv"))
        .add_filter("CSV", &["csv"])
        .blocking_save_file()
    else {
        return Ok(false);
    };

    let path = destination.into_path().map_err(|error| error.to_string())?;
    std::fs::write(path, bytes).map_err(|_| "Could not save the report.".to_owned())?;
    Ok(true)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default().setup(|app| {
        let origin = option_env!("FINTRACK_DESKTOP_API_URL").unwrap_or("http://127.0.0.1:8080");
        app.manage(transport::Api::new(origin)?);
        Ok(())
    });

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    let builder = builder
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![transport::api_request, save_csv]);

    #[cfg(any(target_os = "android", target_os = "ios"))]
    let builder = builder.invoke_handler(tauri::generate_handler![transport::api_request]);

    builder
        .run(tauri::generate_context!())
        .expect("Could not start FinTrack");
}
