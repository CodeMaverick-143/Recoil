# Recoil Deployment Guide

This guide covers how to build and deploy the Recoil application manually on your local machine and automatically using GitHub Actions.

## Prerequisites

Before building locally, ensure you have the following installed:

1.  **Rust**: [Install Rust](https://www.rust-lang.org/tools/install)
2.  **Node.js**: [Install Node.js](https://nodejs.org/) (Project uses v20+)
3.  **System Dependencies**:
    *   **macOS**: XCode Command Line Tools (`xcode-select --install`)
    *   **Windows**: [C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) and [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)
    *   **Linux**:
        ```bash
        sudo apt-get update
        sudo apt-get install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
        ```

## Local Build

To build the application for your current operating system:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Build Command**:
    ```bash
    npm run tauri build
    ```

    *   This command will:
        *   Build the frontend (`npm run build`)
        *   Compile the Rust backend
        *   Generate the installer/bundle for your OS

### Output Locations

After a successful build, artifacts will be located in:

*   **macOS**: `src-tauri/target/release/bundle/dmg/` and `src-tauri/target/release/bundle/macos/`
*   **Windows**: `src-tauri/target/release/bundle/msi/` and `src-tauri/target/release/bundle/nsis/`
*   **Linux**: `src-tauri/target/release/bundle/deb/` and `src-tauri/target/release/bundle/appimage/`

## Automated Releases (GitHub Actions)

This project is configured with a GitHub Actions workflow (`.github/workflows/release.yml`) that automatically builds and creates a release when you push a version tag.

### How to Trigger a Release

1.  **Update Version**:
    Update the `version` field in `src-tauri/tauri.conf.json` and `package.json` to the new version number (e.g., `0.2.0`).

2.  **Commit and Push (with Tag)**:
    ```bash
    git add .
    git commit -m "chore: release v0.2.0"
    git tag v0.2.0
    git push origin v0.2.0
    ```
    *Note: The tag must start with `v` (e.g., `v0.1.0`, `v1.0.0`) to trigger the workflow.*

3.  **Monitor the Action**:
    *   Go to the "Actions" tab in your GitHub repository.
    *   You will see a "Release" workflow running.
    *   This workflow creates a draft release and uploads the built assets for macOS (Universal), Windows, and Linux.

4.  **Publish**:
    *   Once the workflow finishes, go to the "Releases" section.
    *   Edit the drafted release, add release notes, and click "Publish release".

## Configuration

The build configuration is managed in `src-tauri/tauri.conf.json`:

*   **Identifier**: `com.arpitsarang.recoil` - Unique ID for the app.
*   **Bundle Config**:
    *   `active`: Must be `true` to build bundles.
    *   `targets`: set to `"all"` to build for all standard targets on the host OS.
*   **Icons**: App icons are located in `src-tauri/icons/`.

### Cross-Platform Compilation

The GitHub Action uses a matrix strategy to build for all platforms:
*   `macos-latest`: Builds Universal binary (x86_64 and arm64).
*   `ubuntu-22.04`: Builds .deb and .AppImage.
*   `windows-latest`: Builds .msi and .exe.

*Note: You strictly cannot build macOS apps on Windows/Linux or Windows apps on macOS/Linux easily. Rely on the GitHub Action for cross-platform releases.*
