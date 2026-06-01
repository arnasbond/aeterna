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
            UrlStore.setUrl(this, url)
            Toast.makeText(this, R.string.url_saved, Toast.LENGTH_SHORT).show()
            setResult(RESULT_OK)
            finish()
        }

        findViewById<Button>(R.id.btn_reset).setOnClickListener {
            UrlStore.resetUrl(this)
            input.setText(BuildConfig.WEB_APP_URL)
            Toast.makeText(this, R.string.url_reset, Toast.LENGTH_SHORT).show()
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }
}
