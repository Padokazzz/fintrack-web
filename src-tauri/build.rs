fn main() {
    println!("cargo:rerun-if-env-changed=FINTRACK_DESKTOP_API_URL");
    tauri_build::build()
}
