package com.unmute.app

import android.annotation.SuppressLint
import android.webkit.JavascriptInterface
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.KeyEvent
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.appbar.MaterialToolbar
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewFeature
import java.net.URLEncoder

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var errorPanel: LinearLayout
    private lateinit var errorMessage: TextView
    private lateinit var errorUrl: TextView
    private var backPressToast: Toast? = null
    private var loadedBaseUrl: String? = null
    private var pageLoaded = false
    private val handler = Handler(Looper.getMainLooper())
    private val loadTimeout = Runnable { if (!pageLoaded) showError(getString(R.string.error_timeout)) }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val toolbar = findViewById<MaterialToolbar>(R.id.toolbar)
        setSupportActionBar(toolbar)
        toolbar.setOnClickListener { loadHome(force = true) }

        webView = findViewById(R.id.webview)
        errorPanel = findViewById(R.id.error_panel)
        errorMessage = findViewById(R.id.error_message)
        errorUrl = findViewById(R.id.error_url)

        findViewById<Button>(R.id.btn_retry).setOnClickListener {
            hideError()
            loadHome(force = true)
        }
        findViewById<Button>(R.id.btn_settings).setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }

        webView.setBackgroundColor(Color.parseColor("#fcfbf7"))

        with(webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            loadWithOverviewMode = true
            useWideViewPort = true
            mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING)) {
            WebSettingsCompat.setAlgorithmicDarkeningAllowed(webView.settings, true)
        }

        webView.addJavascriptInterface(WebAppBridge(), "AeternaApp")

        webView.webChromeClient = WebChromeClient()
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                pageLoaded = true
                handler.removeCallbacks(loadTimeout)
                if (url?.startsWith("file:///android_asset/error") != true) {
                    hideError()
                }
                updateSubtitle()
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                if (request?.isForMainFrame == true) {
                    val detail = error?.description?.toString() ?: getString(R.string.error_unknown)
                    showError(detail)
                }
            }

            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val url = request?.url?.toString() ?: return false
                if (AppDownloadHelper.isApkDownloadUrl(url)) {
                    AppDownloadHelper.openApkDownload(this@MainActivity)
                    return true
                }
                return false
            }
        }

        // Visada titulinis — ne atkurti paskutinį demo ar kitą puslapį
        loadHome(force = true)

        AppUpdateManager.checkForUpdate(this)
    }

    private fun updateSubtitle() {
        supportActionBar?.subtitle = UrlStore.getUrl(this).trimEnd('/')
    }

    private fun homeUrl(): String {
        return UrlStore.getUrl(this)
    }

    private fun loadHome(force: Boolean = false) {
        val url = homeUrl()
        if (!force && url == loadedBaseUrl && pageLoaded) return
        loadedBaseUrl = url
        pageLoaded = false
        hideError()
        handler.removeCallbacks(loadTimeout)
        handler.postDelayed(loadTimeout, 15_000)
        webView.loadUrl(url)
        updateSubtitle()
    }

    private fun showError(detail: String) {
        handler.removeCallbacks(loadTimeout)
        val url = homeUrl()
        errorMessage.text = detail
        errorUrl.text = url
        errorPanel.visibility = View.VISIBLE
        val enc = URLEncoder.encode(url, Charsets.UTF_8.name())
        webView.loadUrl("file:///android_asset/error.html?url=$enc")
    }

    private fun hideError() {
        errorPanel.visibility = View.GONE
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.main_menu, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_reload -> {
                loadHome(force = true)
                true
            }
            R.id.action_check_update -> {
                AppUpdateManager.checkForUpdate(this, force = true)
                true
            }
            R.id.action_share -> {
                val url = webView.url?.takeIf { it.startsWith("http") } ?: homeUrl()
                val title = webView.title?.takeIf { it.isNotBlank() }
                    ?: getString(R.string.app_name)
                ShareHelper.share(this, url, title, "")
                true
            }
            R.id.action_share_app -> {
                AppDownloadHelper.shareAppInvite(this)
                true
            }
            R.id.action_download_app -> {
                AppDownloadHelper.openApkDownload(this)
                true
            }
            R.id.action_settings -> {
                startActivity(Intent(this, SettingsActivity::class.java))
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
        val url = homeUrl()
        if (url != loadedBaseUrl) {
            loadHome(force = true)
        } else {
            updateSubtitle()
        }
        AppUpdateManager.checkForUpdate(this)
    }

    override fun onPause() {
        handler.removeCallbacks(loadTimeout)
        webView.onPause()
        super.onPause()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    private inner class WebAppBridge {
        @JavascriptInterface
        fun sharePage(title: String, text: String) {
            runOnUiThread {
                val url = webView.url?.takeIf { it.startsWith("http") } ?: homeUrl()
                ShareHelper.share(this@MainActivity, url, title, text)
            }
        }

        @JavascriptInterface
        fun downloadApp() {
            runOnUiThread {
                AppDownloadHelper.openApkDownload(this@MainActivity)
            }
        }

        @JavascriptInterface
        fun goHome() {
            runOnUiThread { loadHome(force = true) }
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (errorPanel.visibility == View.VISIBLE) {
            hideError()
            loadHome(force = true)
            return
        }
        if (webView.canGoBack()) {
            webView.goBack()
            return
        }
        backPressToast?.cancel()
        backPressToast = Toast.makeText(this, R.string.press_back_again, Toast.LENGTH_SHORT)
        backPressToast?.show()
        super.onBackPressed()
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_MENU) {
            startActivity(Intent(this, SettingsActivity::class.java))
            return true
        }
        return super.onKeyDown(keyCode, event)
    }
}
