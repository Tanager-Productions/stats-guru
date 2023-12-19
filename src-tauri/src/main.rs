// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use log::LevelFilter;
use tauri_plugin_log::LogTarget;
use tauri_plugin_log::RotationStrategy;
use tauri_plugin_log::TimezoneStrategy;
fn main() {
  tauri::Builder::default()
		.plugin(tauri_plugin_sql::Builder::default().build())
		.plugin(tauri_plugin_log::Builder::default()
			.targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
			.rotation_strategy(RotationStrategy::KeepAll)
			.timezone_strategy(TimezoneStrategy::UseLocal)
			.level(LevelFilter::Debug).build())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
