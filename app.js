<!DOCTYPE html>
<html>
<head>
  <title>Embedded Signup Test</title>
  <script>
    window.fbAsyncInit = function() {
      FB.init({
        appId            : 'YOUR_APP_ID',  // Replace with your BSP App ID
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v20.0'
      });
    };
  </script>
  <script async defer crossorigin="anonymous"
    src="https://connect.facebook.net/en_US/sdk.js"></script>
</head>
<body>
  <button id="login-btn" style="background-color: #1877f2; border: 0; border-radius: 4px; color: #fff; cursor: pointer; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: bold; height: 40px; padding: 0 24px;">
    Launch Embedded Signup
  </button>
  <script type="text/javascript">
    document.getElementById('login-btn').onclick = () =>
      FB.login(response => {
        console.log(response);
      }, {
        config_id: 'YOUR_CONFIG_ID',  // Replace with your Embedded Signup Config ID
        response_type: 'code',
        override_default_response_type: true,
        scope: 'whatsapp_business_management',
        extras: {
          feature: 'whatsapp_embedded_signup',
          setup: {}
        }
      });

    window.addEventListener('message', (event) => {
      if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") {
        return;
      }
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP' && data.event === 'FINISH') {
          const { phone_number_id, waba_id } = data.data;
          console.log('Onboarded WABA ID:', waba_id, 'Phone Number ID:', phone_number_id);
        }
      } catch {
        // Ignore non-JSON messages
      }
    });
  </script>
</body>
</html>
