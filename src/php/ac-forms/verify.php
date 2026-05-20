<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Verify</title>
    <style>
        @font-face {
            font-family: "Poppins";
            src: url("../fonts/poppins/Poppins-Regular.ttf") format("truetype");
            font-weight: 400;
            font-style: normal;
            font-display: swap;
        }

        @font-face {
            font-family: "Poppins";
            src: url("../fonts/poppins/Poppins-SemiBold.ttf") format("truetype");
            font-weight: 500;
            font-style: normal;
            font-display: swap;
        }

        @font-face {
            font-family: "Poppins";
            src: url("../fonts/poppins/Poppins-Bold.ttf") format("truetype");
            font-weight: 600;
            font-style: normal;
            font-display: swap;
        }

        @font-face {
            font-family: "Inter";
            src: url("../fonts/inter/Inter-VariableFont_opsz,wght.ttf") format("truetype");
            font-weight: 100 900;
            font-style: normal;
            font-display: swap;
        }

        :root {
            --page-bg: #ffffff;
            --card-border: #f1f1f4;
            --text-muted: #4b5675;
            --field-border: #dbdfe9;
            --primary: #450468;
            --primary-hover: #46066d;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        html,
        body {
            width: 100%;
            height: 100%;
        }

        body {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            height: 100vh;
            font-family: Inter, sans-serif;
            background: var(--page-bg);
        }

        .left-col {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }

        .signin-card {
            width: 100%;
            max-width: 420px;
            background: #ffffff;
            border: 1px solid var(--card-border);
            border-radius: 12px;
            padding: 28px 26px;
            box-shadow: 0 3px 4px 0 #00000008;
        }

        .verify-illustration {
            display: block;
            margin: 0 auto 12px;
        }

        .signin-title {
            font-family: Inter;
            font-size: 18px;
            font-weight: 500;
            line-height: 18px;
            text-align: center;
            color: #071437;
        }

        .signin-subtitle {
            margin-top: 30px;
            font-family: Inter;
            font-size: 13px;
            font-weight: 400;
            line-height: 14px;
            text-align: center;
            color: var(--text-muted);
        }

        .phone-mask {
            margin-top: 15px;
            text-align: center;
            font-weight: 600;
            color: #071437;
        }

        .otp-row {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin: 30px 0;
        }

        .otp-input {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid var(--field-border);
            border-radius: 6px;
            background: transparent;
        }

        .otp-input input {
            width: 100%;
            height: 100%;
            border: 0;
            border-radius: 6px;
            outline: none;
            text-align: center;
            font-family: Inter;
            font-size: 13px;
            font-weight: 500;
            color: #2e3a54;
            background: transparent;
        }

        .otp-input input:focus {
            border-radius: 6px;
            border-color: #b6bfd1;
            box-shadow: 0 0 0 3px rgba(84, 11, 128, 0.08);
        }

        .resend-row {
            text-align: center;
            font-size: 13px;
            color: var(--text-muted);
        }

        .resend-row a {
            margin-left: 6px;
            color: var(--primary);
            text-decoration: none;
            font-weight: 500;
        }

        .submit-btn {
            margin-top: 18px;
            width: 100%;
            height: 40px;
            border: none;
            border-radius: 8px;
            background: var(--primary);
            color: #ffffff;
            font-family: Inter;
            font-size: 13px;
            font-weight: 500;
            line-height: 14px;
            letter-spacing: -1%;
            cursor: pointer;
            transition: background 0.2s ease;
        }

        .submit-btn:hover {
            background: var(--primary-hover);
        }

        .right-col {
            height: 100vh;
            background: #f5f7fb;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .right-col img {
            display: block;
            height: 100vh;
            width: auto;
            user-select: none;
            -webkit-user-drag: none;
        }

        @media (max-width: 900px) {
            body {
                grid-template-columns: 1fr;
                height: auto;
                min-height: 100vh;
            }

            .right-col {
                height: auto;
                min-height: 50vh;
            }

            .right-col img {
                height: auto;
                width: 100%;
                max-height: 50vh;
                object-fit: contain;
            }

            .signin-card {
                max-width: 560px;
            }
        }

        @media (max-width: 560px) {
            .left-col {
                padding: 14px;
            }

            .signin-card {
                padding: 20px 16px;
            }

            .otp-row {
                gap: 8px;
            }

            .submit-btn {
                font-size: 17px;
            }
        }
    </style>
</head>
<body>
    <section class="left-col">
        <form class="signin-card" id="verifyForm" action="#" method="post" onsubmit="return false;">
            <img class="verify-illustration" src="../assets/icons/smartphone1.svg" alt="phone">
            <h1 class="signin-title">Verify your phone</h1>
            <p class="signin-subtitle">Enter the verification code we sent to</p>
            <div class="phone-mask">******7859</div>

            <div class="otp-row" aria-label="verification code">
                <div class="otp-input"><input inputmode="numeric" maxlength="1" pattern="[0-9]*" id="otp-1"></div>
                <div class="otp-input"><input inputmode="numeric" maxlength="1" pattern="[0-9]*" id="otp-2"></div>
                <div class="otp-input"><input inputmode="numeric" maxlength="1" pattern="[0-9]*" id="otp-3"></div>
                <div class="otp-input"><input inputmode="numeric" maxlength="1" pattern="[0-9]*" id="otp-4"></div>
                <div class="otp-input"><input inputmode="numeric" maxlength="1" pattern="[0-9]*" id="otp-5"></div>
                <div class="otp-input"><input inputmode="numeric" maxlength="1" pattern="[0-9]*" id="otp-6"></div>
            </div>

            <div class="resend-row">Didn’t receive a code? (<span id="timer">37s</span>) <a href="#" id="resend">Resend</a></div>

            <button class="submit-btn" id="continueBtn">Continue</button>
        </form>
    </section>

    <section class="right-col">
        <img src="bg.png" alt="visual">
    </section>

    <script>
        // OTP input behaviour
        (function () {
            const inputs = Array.from(document.querySelectorAll('.otp-input input'));

            inputs.forEach((input, idx) => {
                input.addEventListener('input', (e) => {
                    const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
                    e.target.value = v;
                    if (v && idx < inputs.length - 1) {
                        inputs[idx + 1].focus();
                    }
                });

                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace' && !e.target.value && idx > 0) {
                        inputs[idx - 1].focus();
                    }
                });

                input.addEventListener('paste', (e) => {
                    e.preventDefault();
                    const paste = (e.clipboardData || window.clipboardData)
                        .getData('text')
                        .replace(/\D/g, '');

                    paste
                        .split('')
                        .slice(0, inputs.length)
                        .forEach((ch, i) => {
                            inputs[i].value = ch;
                        });
                });
            });

            document.getElementById('continueBtn').addEventListener('click', () => {
                const code = inputs.map((i) => i.value || '').join('');

                if (code.length !== inputs.length) {
                    alert('Enter the full code');
                    return;
                }

                fetch('../handlers/verify-otp.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: 'action=verify&email=&otp=' + encodeURIComponent(code)
                })
                    .then((r) => r.json())
                    .then((j) => {
                        if (j.success) {
                            alert(j.message || 'Verified');
                            window.location.href = 'signin.php';
                        } else {
                            alert(j.message || 'Invalid code');
                        }
                    })
                    .catch(() => alert('Network error'));
            });
        })();
    </script>
</body>
</html>
