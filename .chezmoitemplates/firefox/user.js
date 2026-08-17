// user.js -- managed by chezmoi
//
// Applied at every Firefox startup, overriding prefs.js. This is the
// closest analogue to qutebrowser's config.py: plain text, declarative,
// and re-asserted on each launch.

// -- chrome (userChrome.css) -------------------------------------------
// Required for chrome/userChrome.css to be read at all.
user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);

// -- new tab / home ----------------------------------------------------
// Strip the sponsored content and "stories" out of the new tab page.
user_pref("browser.newtabpage.activity-stream.showSponsored", false);
user_pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false);
user_pref("browser.newtabpage.activity-stream.feeds.section.topstories", false);
user_pref("browser.newtabpage.activity-stream.feeds.topsites", false);

// -- telemetry ---------------------------------------------------------
user_pref("datareporting.healthreport.uploadEnabled", false);
user_pref("toolkit.telemetry.enabled", false);
user_pref("toolkit.telemetry.unified", false);
user_pref("browser.ping-centre.telemetry", false);

// -- ui ----------------------------------------------------------------
// Warn-on-quit off; Tridactyl handles tab/window lifecycle.
user_pref("browser.warnOnQuit", false);
user_pref("browser.tabs.warnOnClose", false);
// Don't steal focus from the page on Ctrl-L style navigation.
user_pref("browser.urlbar.suggest.topsites", false);
