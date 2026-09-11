use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: include_str!("../migrations/001_init.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "add_competences",
            sql: include_str!("../migrations/002_add_competences.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "add_reference_job",
            sql: include_str!("../migrations/003_add_reference_job.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "add_url_and_tags",
            sql: include_str!("../migrations/004_add_url_and_tags.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "add_settings",
            sql: include_str!("../migrations/005_add_settings.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "add_settings_trigger_and_index",
            sql: include_str!("../migrations/006_add_settings_trigger_and_index.sql"),
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:candidatures.db", migrations)
                .build()
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
