plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val webAppUrl: String =
    (project.findProperty("WEB_APP_URL") as String?)
        ?: "https://aeterna-mauve.vercel.app"

val apiBaseUrl: String =
    (project.findProperty("API_BASE_URL") as String?)
        ?: "https://api-three-chi-63.vercel.app"

android {
    namespace = "com.unmute.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.unmute.app"
        minSdk = 24
        targetSdk = 35
        versionCode = (project.findProperty("APP_VERSION_CODE") as String?)?.toIntOrNull() ?: 1
        versionName = (project.findProperty("APP_VERSION_NAME") as String?) ?: "0.1.0-dev"
        buildConfigField("String", "WEB_APP_URL", "\"$webAppUrl\"")
        buildConfigField("String", "API_BASE_URL", "\"$apiBaseUrl\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("debug")
        }
        debug {
            applicationIdSuffix = ".debug"
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        buildConfig = true
    }
}

dependencies {
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("com.google.android.material:material:1.12.0")
}
