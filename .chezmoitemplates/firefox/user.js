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

// -- tabs / sidebar ----------------------------------------------------
// Tabs are Firefox's NATIVE vertical tabs, not an extension. Firefox moves
// the real tab strip into the sidebar's vertical toolbar and renders it
// vertically -- same tabs, different orientation.
//
// These are also LOCKED in policies.json (that is what actually enforces
// them); repeated here so a profile without the policy still behaves.
//   sidebar.revamp       = true   -- vertical tabs live in the revamped
//                                    sidebar; they do not render without it
//   sidebar.verticalTabs = true   -- tabs in the sidebar instead of on top
//   sidebar.visibility   = always-show -- otherwise the launcher hides itself
//   sidebar.position_start = false     -- sidebar on the RIGHT
user_pref("sidebar.revamp", true);
user_pref("sidebar.verticalTabs", true);
user_pref("sidebar.visibility", "always-show");
user_pref("sidebar.position_start", false);

// -- new tab / new window ----------------------------------------------
// New TABS are fine: Tridactyl overrides about:newtab via
// chrome_url_overrides, and .tridactylrc redirects that to about:blank.
//
// New WINDOWS cannot be fixed. Firefox loads the first tab from
// browser.startup.homepage itself, and every reachable target is a page no
// extension can run on:
//   about:home / about:newtab -> privileged, no content script
//   about:blank as a homepage -> null principal, so match_about_blank
//                                does not apply (it only covers about:blank
//                                that inherits a principal from an opener)
//   moz-extension://<uuid>/... -> would work, but the UUID is generated
//                                per profile and cannot be pinned portably
// The homepage is therefore about:blank: instant and empty rather than
// Firefox's newtab page. Press Ctrl-, or navigate somewhere to get Tridactyl.
