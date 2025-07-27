import sdk from './web-sdk.js';
let deviceInfo = null;
let tranId = null;
let authType = null;
let selectedItem = '';
let selectedPrice = 0;
let totalAmount = 0;
let selectedStoreName = null;
window.addEventListener('DOMContentLoaded', () => {
 
  window.getBrowserName = function () {
    const userAgent = navigator.userAgent;

    if (userAgent.includes("Edg/")) return "Edge";
    if (userAgent.includes("OPR/") || userAgent.includes("Opera")) return "Opera";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("MSIE") || userAgent.includes("Trident/")) return "Internet Explorer";

    return "Unknown";
  }

   window.selectStore = function (storeName){
    selectedStoreName = storeName;
    document.getElementById('storeSelectionPage').classList.add('hidden')
    document.getElementById('shopSection').classList.remove('hidden');
    document.getElementById('paymentSection').classList.add('hidden');
    document.getElementById('otpSection').classList.add('hidden');
    document.getElementById('success-section').classList.add('hidden');
    document.getElementById('oob-container').classList.add('hidden');
  }
  window.getOSName = function () {
    const platform = navigator.platform.toLowerCase();
    const userAgent = navigator.userAgent;

    if (platform.includes("win")) return "Windows";
    if (platform.includes("mac")) return "macOS";
    if (platform.includes("linux")) return "Linux";
    if (/android/i.test(userAgent)) return "Android";
    if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS";

    return "Unknown";
  }

  window.goToPayment = function (item, price) {
    document.getElementById('storeSelectionPage').classList.add('hidden')
    document.getElementById('shopSection').classList.add('hidden');
    document.getElementById('paymentSection').classList.remove('hidden');
    document.getElementById('otpSection').classList.add('hidden');
    document.getElementById('success-section').classList.add('hidden');
    document.getElementById('oob-container').classList.add('hidden');
    selectedItem = item;
    selectedPrice = price;
    totalAmount = parseFloat((price * 1.1).toFixed(2));
    const tax = (price * 0.1).toFixed(2);

    document.getElementById('itemName').textContent = item;
    document.getElementById('itemPrice').textContent = '$' + price.toFixed(2);
    document.getElementById('taxAmount').textContent = '$' + tax;
    document.getElementById('totalAmount').textContent = '$' + totalAmount;
    const sessionId = crypto.randomUUID();

    // Retry until SDK is available
    const tryInitialize = () => {
      if (sdk && typeof sdk.initialize === 'function') {
        sdk.initialize({
          env: 'PROD',
          sessionId: sessionId,
          apiKey: 'acurazi-demo',
          apiSecret: 'secret-2c8456e3-d377-4502-803e-c64c157d27ba',
        })
          .then(result => result.get())
          .then(data => {
            deviceInfo = data;
            deviceInfo.riskScore = mapRiskScore(data.riskScore);
          })
          .catch(err => {
            console.error("SDK Error:", err);
            // alert("SDK failed: " + err.message);
          });
      } else {
        console.warn("SDK not ready, retrying...");
        setTimeout(tryInitialize, 200); // retry after 200ms
      }
    };
    setTimeout(() => {
      tryInitialize();
    }, 500);

  }
  window.continueShopping = function () {
  document.getElementById('storeSelectionPage').classList.remove('hidden');
  document.getElementById('shopSection').classList.add('hidden');
  document.getElementById('paymentSection').classList.add('hidden');
  document.getElementById('otpSection').classList.add('hidden');
  document.getElementById('success-section').classList.add('hidden');
  document.getElementById('oob-container').classList.add('hidden');

  // Optionally reset cart variables
  selectedItem = '';
  selectedPrice = 0;
  totalAmount = 0;
  selectedStoreName = null;

  // Reset display
  const paidAmountEl = document.getElementById('paidAmount');
  if (paidAmountEl) paidAmountEl.textContent = '$0.00';
};

  window.mapRiskScore = function (score) {
    if (typeof score === 'string') {
      switch (score.toLowerCase()) {
        case 'low': return 30;
        case 'medium': return 65;
        case 'high': return 90;
        default: return 0;
      }
    }
    return score; // If already a number (0–100)
  }
  window.goBacktoStore = function (){
    document.getElementById('storeSelectionPage').classList.remove('hidden')
    document.getElementById('shopSection').classList.add('hidden');
    document.getElementById('paymentSection').classList.add('hidden');
    document.getElementById('otpSection').classList.add('hidden');
    document.getElementById('success-section').classList.add('hidden');
    document.getElementById('oob-container').classList.add('hidden');
  }
  window.goBack = function () {
    document.getElementById('storeSelectionPage').classList.add('hidden')
    document.getElementById('shopSection').classList.remove('hidden');
    document.getElementById('paymentSection').classList.add('hidden');
    document.getElementById('otpSection').classList.add('hidden');
    document.getElementById('success-section').classList.add('hidden');
    document.getElementById('oob-container').classList.add('hidden');
  }
  //     window.validateCard = function (){
  //       const cardNumber = document.getElementById('cardNumber').value.trim();
  //       const expiryDate = document.getElementById('expiryDate').value.trim();
  //       const cvv = document.getElementById('cvv').value.trim();
  //       const cardName = document.getElementById('cardName').value.trim();

  //       const isValid =
  //         cardNumber.length === 16 &&
  //         expiryDate.length === 5 &&
  //         cvv.length === 3 &&
  //         cardName.length > 0;

  //       document.getElementById('payBtn').disabled = !isValid;
  //     }
  //    window.addEventListener('DOMContentLoaded', () => {
  //   const inputs = ['cardNumber', 'expiryDate', 'cvv', 'cardName'];
  //   inputs.forEach(id => {
  //     document.getElementById(id).addEventListener('input', validateCardForm);
  //   });
  // });
  window.initiatePayment = function () {
    showToast('Payment initiated successfully!', 'success');
    const totalAmountText = document.getElementById('totalAmount').textContent;
    const totalAmount = parseFloat(totalAmountText.replace('$', ''));
    const cardNumber = document.getElementById('cardNumber').value;
    const payload = {
      "channelId": "01",
      "customerId": cardNumber,
      "transactionInfo": {
        "type": "transaction",
        "date": "2025-07-23 15:40:00",
        "amount": totalAmount,
        "currencyCode": "840",
        "merchantName": selectedStoreName,
        "merchantUrl": ""
      },
      "deviceInfo": {
        "deviceId": deviceInfo.fingerprint,
        "browser": getBrowserName(),
        "operatingSystem": getOSName(),
        "requestId": deviceInfo.requestId,
        "ipAddress": deviceInfo.ipIntelligence?.ip,
        "sessionId": deviceInfo.sessionId,
        "userAgent": navigator.userAgent,
        "geoLocation": `${deviceInfo.ipIntelligence.city}, ${deviceInfo.ipIntelligence.region},${deviceInfo.ipIntelligence.country}`,
        "isVpn": deviceInfo.ipIntelligence.isVPN,
        "isProxy": deviceInfo.ipIntelligence.isProxy,
        "isTor": deviceInfo.ipIntelligence.isTor,
        "internetProvider": "Not Resolved",
        "botDetected": deviceInfo.browserDetections.isBotDetected,
        "riskScore": 65
      }

    };
    console.log(payload);
     const apiUrl = "https://acurazi.sandbox.appsteer.io/services/mobile/external/triggerAPI/087145b7-f8d7-44eb-aff9-668fce83bec1"
    fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-AUTH-TOKEN': '77a68bb2-9c45-4860-89f8-4cefcb3d1cf2' // Replace if needed
      },
      body: JSON.stringify(payload)
    }).then(res => res.json())
      .then(response => {
        tranId = response.tranId;
        authType = response.authType;
        if (response.status === 'RN') {
          showToast('Declined transaction done by ruleEngine', 'error')
        }
        else if (response.status === 'RY') {
          document.getElementById('storeSelectionPage').classList.add('hidden')
          document.getElementById('shopSection').classList.add('hidden');
          document.getElementById('paymentSection').classList.add('hidden');
          document.getElementById('otpSection').classList.add('hidden');
          document.getElementById('success-section').classList.remove('hidden');
          document.getElementById('oob-container').classList.add('hidden');
          document.getElementById('paidAmount').textContent = '$' + totalAmount;
          showToast('Authentication successful!', 'success');
        }
        else if (response.status === 'AR' && response.authType === 'OTP') {
          document.getElementById('storeSelectionPage').classList.add('hidden')
          document.getElementById('shopSection').classList.add('hidden');
          document.getElementById('paymentSection').classList.add('hidden');
          document.getElementById('otpSection').classList.remove('hidden');
          document.getElementById('success-section').classList.add('hidden');
          document.getElementById('oob-container').classList.add('hidden');
          showToast('OTP sent successfully!', 'info');
        }
        else if (response.status === 'AR' && response.authType === 'OOB') {
          document.getElementById('storeSelectionPage').classList.add('hidden')
          document.getElementById('shopSection').classList.add('hidden');
          document.getElementById('paymentSection').classList.add('hidden');
          document.getElementById('otpSection').classList.add('hidden');
          document.getElementById('success-section').classList.add('hidden');
          document.getElementById('oob-container').classList.remove('hidden');
          let oobAttempts = 0;
          let oobInterval = setInterval(() => {
            oobAttempts++;

            validateOob().then((success) => {
              if (success) {
                clearInterval(oobInterval); // Stop retrying on success
              } else if (oobAttempts >= 3) {
                clearInterval(oobInterval); // Stop after 3 attempts
                showToast('Authentication failed after 3 attempts.', 'error');
              }
            });

          }, 5000);

        }
      }).catch(err => {
        console.error("API ERRPR", err)
      })

    // Start trying
  }
 window.validateOob = function () {
  return new Promise((resolve) => {
    const oobapi = 'https://frm-demo.appsteer.io/services/mobile/external/triggerAPI/feab07db-c260-4aea-8f57-465fba6176ff';
    const oob = {
      "tranId": tranId,
      "authType": "OOB"
    };
    fetch(oobapi, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-AUTH-TOKEN': '77a68bb2-9c45-4860-89f8-4cefcb3d1cf2'
      },
      body: JSON.stringify(oob)
    }).then(data => data.json())
      .then(res => {
        if (res.message === 'Authentication success') {
          document.getElementById('storeSelectionPage').classList.add('hidden')
          document.getElementById('shopSection').classList.add('hidden');
          document.getElementById('paymentSection').classList.add('hidden');
          document.getElementById('otpSection').classList.add('hidden');
          document.getElementById('success-section').classList.remove('hidden');
          document.getElementById('oob-container').classList.add('hidden');
          document.getElementById('paidAmount').textContent = '$' + totalAmount;
          showToast('Authentication successful!', 'success');
          resolve(true); // ✅ resolve success
        } else {
          showToast(res.message, 'error');
          resolve(false); // ❌ resolve failure
        }
      }).catch(() => {
        showToast("OOB validation failed.", 'error');
        resolve(false); // ❌ also resolve failure on error
      });
  });
};

  window.resendOtp = function () {
    const resendApi = 'https://frm-demo.appsteer.io/services/mobile/external/triggerAPI/54fcf5d6-e19b-4df4-9ef4-5fd4e7f92ba7';
    const resend = {
      "tranId": tranId,
      "isOtpResend": true
    }
    fetch(resendApi, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-AUTH-TOKEN': '77a68bb2-9c45-4860-89f8-4cefcb3d1cf2'
      },
      body: JSON.stringify(resend)
    }).then(data => data.json())
      .then(res => {
        if (res.message === 'Resend success') {
          showToast('Resend OTP successfully!', 'success');
        }
        else {
          showToast('Resend OTP failed!', 'error');
        }
      })
  }
  window.submitOtp = function () {
    const token = document.getElementById('otpInput').value;
    const otpApiUrl = 'https://frm-demo.appsteer.io/services/mobile/external/triggerAPI/a91de6d5-94ca-4241-829e-386085d776ed';
    const otpPayload = {
      "tranId": tranId,
      "authType": authType,
      "authValue": token
    };
    fetch(otpApiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-AUTH-TOKEN': '77a68bb2-9c45-4860-89f8-4cefcb3d1cf2'
      },
      body: JSON.stringify(otpPayload)
    }).then(res => res.json())
      .then(response => {
        if (response.message === 'Authentication success') {
          // document.getElementById('paidAmount').textContent = '$' + totalAmount;
          document.getElementById('storeSelectionPage').classList.add('hidden')
          document.getElementById('shopSection').classList.add('hidden');
          document.getElementById('paymentSection').classList.add('hidden');
          document.getElementById('otpSection').classList.add('hidden');
          document.getElementById('success-section').classList.remove('hidden');
          document.getElementById('oob-container').classList.add('hidden');
          document.getElementById('paidAmount').textContent = '$' + totalAmount;
          showToast('Authentication successful!', 'success');
        }
        else if (response.status === 'SAR' && response.stepupAuthType === 'OOB') {
          const stepupOobPayload = {
            tranId: tranId,
            stepupAuthType: 'OOB'
          };
        
          fetch('https://acurazi.sandbox.appsteer.io/services/mobile/external/triggerAPI/087145b7-f8d7-44eb-aff9-668fce83bec1', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-AUTH-TOKEN': '77a68bb2-9c45-4860-89f8-4cefcb3d1cf2'
            },
            body: JSON.stringify(stepupOobPayload)
          }).then(res => res.json())
            .then(triggerResponse => {
              console.log(triggerResponse)
              if (triggerResponse.authType === 'OOB') {
                document.getElementById('storeSelectionPage').classList.add('hidden')
                document.getElementById('shopSection').classList.add('hidden');
                document.getElementById('paymentSection').classList.add('hidden');
                document.getElementById('otpSection').classList.add('hidden');
                document.getElementById('success-section').classList.add('hidden');
                document.getElementById('oob-container').classList.remove('hidden');

                let oobAttempts = 0;
                let oobInterval = setInterval(() => {
                  oobAttempts++;

                  validateOob().then((success) => {
                    if (success) {
                      clearInterval(oobInterval); // Stop retrying on success
                    } else if (oobAttempts >= 3) {
                      clearInterval(oobInterval); // Stop after 3 attempts
                      showToast('Step-up OOB authentication failed.', 'error');
                    }
                  });

                }, 5000);
              } else {
                showToast('Step-up OOB initiation failed.', 'error');
              }
            })
            .catch(err => {
              console.error('Step-up OOB Error:', err);
              showToast('Step-up OOB request failed.', 'error');
            });

        }
        else {
          showToast(response.message, 'error');
        }
      })
  }
  // window.validateOobSar =function (){
  //   return new Promise((resolve) => {
  //   const oobapi = 'https://frm-demo.appsteer.io/services/mobile/external/triggerAPI/feab07db-c260-4aea-8f57-465fba6176ff';
  //   const oob = {
  //     "tranId": tranId,
  //     "authType": authType
  //   };
  //   fetch(oobapi, {
  //     method: 'PUT',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'X-AUTH-TOKEN': '77a68bb2-9c45-4860-89f8-4cefcb3d1cf2'
  //     },
  //     body: JSON.stringify(oob)
  //   }).then(data => data.json())
  //     .then(res => {
  //       if (res.message === 'Authentication success') {
  //         document.getElementById('storeSelectionPage').classList.add('hidden')
  //         document.getElementById('shopSection').classList.add('hidden');
  //         document.getElementById('paymentSection').classList.add('hidden');
  //         document.getElementById('otpSection').classList.add('hidden');
  //         document.getElementById('success-section').classList.remove('hidden');
  //         document.getElementById('oob-container').classList.add('hidden');
  //         document.getElementById('paidAmount').textContent = '$' + totalAmount;
  //         showToast('Authentication successful!', 'success');
  //         resolve(true); // ✅ resolve success
  //       } else {
  //         showToast(res.message, 'error');
  //         resolve(false); // ❌ resolve failure
  //       }
  //     }).catch(() => {
  //       showToast("OOB validation failed.", 'error');
  //       resolve(false); // ❌ also resolve failure on error
  //     });
  // });
  // }

  window.showToast = function (message, type = 'success') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
    padding: 12px 20px;
    color: white;
    border-radius: 6px;
    min-width: 200px;
    max-width: 400px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    font-family: sans-serif;
    font-size: 14px;
    background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
    animation: slidein 0.3s ease, fadeout 0.5s ease 2.5s;
    opacity: 1;
  `;

    const container = document.getElementById('toast-container');
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => container.removeChild(toast), 500);
    }, 3000);
  };


});