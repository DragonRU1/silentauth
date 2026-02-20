(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var buttons = document.querySelectorAll(".silentauth-btn");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        handleVerify(btn);
      });
    });
  });

  function handleVerify(btn) {
    if (btn.classList.contains("sa-verified") || btn.classList.contains("sa-loading")) {
      return;
    }

    var wrap = btn.closest(".silentauth-wrap");
    var hiddenInput = wrap.querySelector('input[name="silentauth_token"]');
    var originalText = btn.textContent;

    btn.classList.add("sa-loading");
    btn.textContent = "Verifying\u2026";
    btn.disabled = true;

    // Step 1: Create session via WP AJAX
    var formData = new FormData();
    formData.append("action", "silentauth_create_session");
    formData.append("nonce", silentauth_config.nonce);

    fetch(silentauth_config.ajax_url, {
      method: "POST",
      body: formData,
    })
      .then(function (res) { return res.json(); })
      .then(function (response) {
        if (!response.success || !response.data.token) {
          throw new Error(response.data?.message || "Failed to create session");
        }

        var token = response.data.token;

        // Step 2: Verify session via public API
        return fetch(silentauth_config.api_url + "/api/sessions/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: token,
            proofData: {
              verifiedAt: new Date().toISOString(),
              userAgent: navigator.userAgent,
              referrer: document.referrer || location.href,
            },
          }),
        })
          .then(function (res) { return res.json(); })
          .then(function (verifyResult) {
            if (verifyResult.status !== "VERIFIED") {
              throw new Error("Verification failed");
            }

            // Success
            hiddenInput.value = token;
            btn.classList.remove("sa-loading");
            btn.classList.add("sa-verified");
            btn.textContent = "Verified \u2713";
          });
      })
      .catch(function (err) {
        btn.classList.remove("sa-loading");
        btn.disabled = false;
        btn.textContent = originalText;
        console.error("[SilentAuth]", err.message);
      });
  }
})();
