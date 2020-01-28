BrowserPass OTP
===============

This is a companion extension which adds OTP capabilities to Browserpass. Whenever Browserpass is used to fill or copy login details, that entry is checked for a TOTP seed. If such a seed exists, it will be used to generate an OTP code.

TOTP seeds may be provided either as an otpauth URL (e.g. `otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example`) or as a plain seed (e.g. `totp: JBSWY3DPEHPK3PXP`). Please note that the plain form is unsuitable for any TOTP implementation that does not use a period of 30 seconds and a length of 6 digits.

The OTP code may be accessed by clicking on the OTP extension icon, and can be copied to the clipboard by clicking the 'copy' icon. In addition, the generated OTP code will be copied to the clipboard immediately after Browserpass is invoked, unless Browserpass is already using the clipboard for something else.

Please note that this extension requires Browserpass v3.0.13 or greater in order to function - earlier versions will not trigger OTP at all. It does not currently require any configuration.
