package com.unmute.app

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class SettingsActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        title = getString(R.string.settings_title)

        findViewById<TextView>(R.id.apk_version_banner).text =
            getString(R.string.apk_version_banner, BuildConfig.VERSION_NAME, BuildConfig.VERSION_CODE)

        val input = findViewById<EditText>(R.id.url_input)
        val hint = findViewById<TextView>(R.id.url_hint)

        input.setText(UrlStore.getUrl(this))
        hint.text = getString(R.string.default_url_hint, BuildConfig.WEB_APP_URL)

        findViewById<Button>(R.id.btn_save).setOnClickListener {
            val url = input.text.toString().trim()
            if (url.isEmpty() || !url.startsWith("http")) {
                Toast.makeText(this, R.string.url_invalid, Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            val safe = UrlStore.ensureWebHost(url)
            if (safe != UrlStore.normalizeBaseUrl(url)) {
                Toast.makeText(this, R.string.url_invalid, Toast.LENGTH_LONG).show()
                input.setText(safe)
            }
            UrlStore.setUrl(this, safe)
            Toast.makeText(this, R.string.url_saved, Toast.LENGTH_SHORT).show()
            setResult(RESULT_OK)
            finish()
        }

        findViewById<Button>(R.id.btn_reset).setOnClickListener {
            UrlStore.resetUrl(this)
            input.setText(BuildConfig.WEB_APP_URL)
            Toast.makeText(this, R.string.url_reset, Toast.LENGTH_SHORT).show()
        }

        findViewById<Button>(R.id.btn_cloud_auto).setOnClickListener {
            UrlStore.resetUrl(this)
            input.setText(BuildConfig.WEB_APP_URL)
            Toast.makeText(this, R.string.cloud_mode_enabled, Toast.LENGTH_LONG).show()
            setResult(RESULT_OK)
            finish()
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }
}
