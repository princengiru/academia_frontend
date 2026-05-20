<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reset Password</title>
    <style>
        @font-face {
            font-family: "Inter";
            src: url("../fonts/inter/Inter-VariableFont_opsz,wght.ttf") format("truetype");
            font-weight: 100 900;
            font-style: normal;
            font-display: swap;
        }

        :root {
            --page-bg: white;
            --card-bg: white;
            --card-border: #F1F1F4;
            --text-main: #1c2742;
            --text-muted: #4B5675;
            --field-border: #DBDFE9;
            --field-bg: #f2f4f8;
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

        .signin-title {
            font-family: Inter;
            font-weight: 500;
            font-style: Medium;
            font-size: 18px;
            leading-trim: CAP_HEIGHT;
            line-height: 18px;
            letter-spacing: -1%;
            text-align: center;
        }

        .signin-subtitle {
            margin-top: 7px;
            font-family: Inter;
            font-weight: 400;
            font-style: Regular;
            font-size: 13px;
            leading-trim: NONE;
            line-height: 14px;
            letter-spacing: 0%;
            text-align: center;
            color: var(--text-muted);
        }

        .field-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 20px;
        }

        .field-group > label {
            font-family: Inter;
            font-weight: 400;
            font-style: Regular;
            font-size: 13px;
            leading-trim: NONE;
            line-height: 14px;
            letter-spacing: 0%;
            color: #071437;
        }

        .input-wrap {
            position: relative;
        }

        .input-wrap input {
            width: 100%;
            height: 40px;
            border-radius: 6px;
            border: 1px solid var(--field-border);
            background: transparent;
            padding: 0 12px;
            color: #2e3a54;
            outline: none;
            font-family: Inter;
            font-weight: 400;
            font-style: Regular;
            font-size: 13px;
            leading-trim: NONE;
            line-height: 14px;
            letter-spacing: 0%;
        }

        .input-wrap input::placeholder {
            color: #8a94a9;
        }

        .input-wrap input:focus {
            border-color: #b6bfd1;
            box-shadow: 0 0 0 3px rgba(84, 11, 128, 0.08);
        }

        .input-wrap.password input {
            padding-right: 40px;
        }

        .input-eye {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            width: 18px;
            height: 18px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #97a1b5;
            cursor: pointer;
        }

        .input-eye img {
            width: 18px;
            height: 18px;
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

            .input-wrap input {
                height: 40px;
                font-size: 13px;
            }

            .submit-btn {
                font-size: 17px;
            }
        }
    </style>
</head>
<body>
    <section class="left-col">
        <main class="signin-card">
            <h1 class="signin-title">Reset Password</h1>
            <p class="signin-subtitle">Enter your new password</p>

            <form id="resetForm" action="#" method="post">
                <div class="field-group">
                    <label for="newPassword">New Password</label>
                    <div class="input-wrap password">
                        <input id="newPassword" name="newPassword" type="password" placeholder="Enter Password" required>
                        <span class="input-eye" data-target="newPassword"><img src="../assets/icons/eye.svg" alt=""></span>
                    </div>
                </div>

                <div class="field-group">
                    <label for="confirmPassword">Confirm New Password</label>
                    <div class="input-wrap password">
                        <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Re-enter a new Password" required>
                        <span class="input-eye" data-target="confirmPassword"><img src="../assets/icons/eye.svg" alt=""></span>
                    </div>
                </div>

                <button class="submit-btn" type="submit">Submit</button>
            </form>
        </main>
    </section>

    <section class="right-col">
        <img src="bg.png" alt="visual">
    </section>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const form = document.getElementById('resetForm');
            const eyeIcons = Array.from(document.querySelectorAll('.input-eye'));

            eyeIcons.forEach((icon) => {
                icon.addEventListener('click', () => {
                    const input = document.getElementById(icon.dataset.target);
                    const isPassword = input.type === 'password';
                    input.type = isPassword ? 'text' : 'password';
                });
            });

            form.addEventListener('submit', function (e) {
                e.preventDefault();

                const password = form.querySelector('input[id="newPassword"]').value;
                const confirmPassword = form.querySelector('input[id="confirmPassword"]').value;

                if (password === '' || confirmPassword === '') {
                    alert('Please fill in both fields.');
                    return;
                }

                if (password !== confirmPassword) {
                    alert('Passwords do not match.');
                    return;
                }

                alert('Password reset form ready.');
            });
        });
    </script>
</body>
</html>
