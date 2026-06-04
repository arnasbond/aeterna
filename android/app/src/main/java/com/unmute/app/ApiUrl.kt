package com.unmute.app

import java.net.URL

object ApiUrl {
    /**
     * Vercel: svetainė aeterna-web-six, API api-three-chi-63.
     * LAN/dev: tas pats PC su portu 4000.
     */
    fun resolveApiBase(webUrl: String): String {
        val trimmed = webUrl.trim().trimEnd('/')
        if (trimmed.isEmpty()) return BuildConfig.API_BASE_URL.trimEnd('/')

        if (isVercelProductionWeb(trimmed)) {
            return BuildConfig.API_BASE_URL.trimEnd('/')
        }

        if (trimmed.startsWith("https://")) {
            return trimmed
        }

        if (trimmed.contains(":3000")) {
            return trimmed.replace(":3000", ":4000")
        }

        return try {
            val u = URL(trimmed)
            when {
                u.port == 3000 -> "${u.protocol}://${u.host}:4000"
                u.port == -1 -> "${u.protocol}://${u.host}:4000"
                else -> "${u.protocol}://${u.host}:${u.port}"
            }
        } catch (_: Exception) {
            trimmed
        }
    }

    private fun isVercelProductionWeb(url: String): Boolean {
        if (!url.startsWith("https://")) return false
        return url.contains("aeterna-web-six") ||
            url.contains("aeterna-web") ||
            (url.contains(".vercel.app") && !url.contains("api-"))
    }
}
