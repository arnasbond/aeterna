package com.unmute.app

import java.net.URL

object ApiUrl {
    /** HTTPS production — tas pats hostas (API per Next rewrite). Dev — :4000 */
    fun resolveApiBase(webUrl: String): String {
        val trimmed = webUrl.trim().trimEnd('/')
        if (trimmed.isEmpty()) return "https://aeterna-web.onrender.com"

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
}
