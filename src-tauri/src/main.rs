// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use log::LevelFilter;
fn main() {
  tauri::Builder::default()
		.plugin(tauri_plugin_sql::Builder::default().build())
		.plugin(tauri_plugin_log::Builder::default()
		.level(LevelFilter::Debug).build())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
