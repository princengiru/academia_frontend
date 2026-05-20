<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Sign In</title>
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

		@font-face {
			font-family: "Montserrat";
			src: url("../fonts/montserrat/Montserrat-VariableFont_wght.ttf") format("truetype");
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
			overflow: hidden;
			font-family: "Inter", sans-serif;
			background: var(--page-bg);
		}

		.left-col {
			background: var(--page-bg);
			min-height: 100vh;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 24px;
		}

		.signin-card {
			width: 100%;
			max-width: 420px;
			background: white;
			border: 1px solid var(--card-border);
			border-radius: 12px;
			padding: 28px 26px;
			box-shadow: 0px 3px 4px 0px #00000008;
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

		.signin-subtitle a {
			color: var(--primary);
			text-decoration: none;
			margin-left: 6px;
			font-weight: 500;
		}

		.signin-social {
			margin-top: 20px;
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 10px;
			padding: 0 20px;
		}

		.social-btn {
			min-height: 32px;
			border: 1px solid var(--field-border);
			border-radius: 8px;
			background: #f8f9fc;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 8px;
			font-family: Inter;
			font-weight: 500;
			font-style: Medium;
			font-size: 12px;
			leading-trim: NONE;
			line-height: 12px;
			letter-spacing: 0%;
			cursor: pointer;
		}

		.social-btn .btn-icon {
			width: 16px;
			height: 16px;
			display: inline-block;
			flex: 0 0 auto;
		}

		.social-btn.google .btn-icon {
			font-style: normal;
			font-weight: 700;
			font-size: 16px;
			line-height: 16px;
		}

		.social-btn.apple .btn-icon svg {
			width: 16px;
			height: 16px;
			display: block;
			fill: #000000;
		}

		.signin-divider {
			margin: 20px 0;
			display: flex;
			align-items: center;
			gap: 8px;
			font-family: Inter;
			font-weight: 400;
			font-style: Regular;
			font-size: 11px;
			leading-trim: NONE;
			line-height: 12px;
			letter-spacing: 0%;
			text-align: center;
			color: #78829D;
		}

		.signin-divider::before,
		.signin-divider::after {
			content: "";
			flex: 1;
			height: 1px;
			background: #d7dce6;
		}

		.field-group {
			display: flex;
			flex-direction: column;
			gap: 10px;
			margin-top: 20px;
		}

		.field-label-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			font-family: Inter;
			font-weight: 400;
			font-style: Regular;
			font-size: 13px;
			leading-trim: NONE;
			line-height: 14px;
			letter-spacing: 0%;
			color: #071437;
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

		.field-label-row a {
			text-decoration: none;
			color: var(--primary);
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

		.remember-row {
			margin-top: 16px;
			display: flex;
			align-items: center;
			gap: 8px;
			color: var(--primary);
			font-size: 14px;
			font-weight: 500;
		}

		.remember-row input {
			width: 18px;
			height: 18px;
			appearance: none;
			-webkit-appearance: none;
			border: 1px solid #c8cfdb;
			border-radius: 4px;
			background: #f5f7fb;
			accent-color: var(--primary);
						cursor: pointer;
			position: relative;
		}

		.remember-row input:checked {
			background: var(--primary);
			border-color: var(--primary);
		}

		.remember-row input:checked::after {
			content: "";
			position: absolute;
			left: 6px;
			top: 2px;
			width: 4px;
			height: 9px;
			border: solid #ffffff;
			border-width: 0 2px 2px 0;
			transform: rotate(45deg);
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
			font-weight: 500;
			font-style: Medium;
			font-size: 13px;
			leading-trim: NONE;
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
			max-width: none;
			-webkit-user-drag: none;
			user-select: none;
			pointer-events: none;
		}

		@media (max-width: 900px) {
			body {
				grid-template-columns: 1fr;
				height: auto;
				min-height: 100vh;
				overflow: auto;
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
				font-family: Inter;
				font-weight: 400;
				font-style: Regular;
				font-size: 13px;
				leading-trim: NONE;
				line-height: 14px;
				letter-spacing: 0%;
				text-align: center;
			}

			.field-group > label {
				font-size: 14px;
			}

			.signin-social {
				grid-template-columns: 1fr;
			}

			.submit-btn {
				font-size: 17px;
			}
		}
	</style>
</head>
<body>
	<section class="left-col">
		<form class="signin-card" action="#" method="post" onsubmit="return false;">
			<h1 class="signin-title">Sign in</h1>
			<p class="signin-subtitle">Need an account? <a href="#">Sign up</a></p>

			<div class="signin-social">
								<button type="button" class="social-btn google"><img class="btn-icon" src="../assets/icons/google.svg" alt="Google">Use Google</button>
				<button type="button" class="social-btn apple"><span class="btn-icon" aria-hidden="true"><svg viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-49.6 40.6-73.5 42.4-74.6-23.1-33.8-58.9-38.5-71.7-39-30.5-3.1-59.6 18-75.1 18-15.6 0-39.7-17.6-65.2-17.1-33.5 .5-64.5 19.5-81.8 49.8-35.1 60.8-9 150.8 25.2 200.2 16.7 24.1 36.6 51.2 62.8 50.2 25.2-1 34.7-16.3 65.2-16.3 30.5 0 39 16.3 65.8 15.8 27.3-.5 44.6-24.6 61.2-48.8 19.2-28.1 27.1-55.3 27.6-56.7-.6-.3-52.8-20.3-53-80.5zM269.3 111.5c13.9-16.9 23.3-40.3 20.8-63.5-20 .8-44.2 13.3-58.5 30.2-12.9 14.9-24.2 38.6-21.2 61.4 22.3 1.7 45-11.3 58.9-28.1z"/></svg></span>Use Apple</button>
			</div>

			<div class="signin-divider">OR</div>

			<div class="field-group">
				<label for="signinEmail">Email</label>
				<div class="input-wrap">
					<input id="signinEmail" type="email" placeholder="email@email.com">
				</div>
			</div>

			<div class="field-group">
				<div class="field-label-row">
					<label for="signinPassword">Password</label>
					<a href="#">Forgot Password?</a>
				</div>
				<div class="input-wrap password">
					<input id="signinPassword" type="password" placeholder="Enter Password">
					<img src="../assets/icons/eye.svg" class="input-eye">
				</div>
			</div>

			<label class="remember-row" for="signinRemember">
				<input id="signinRemember" type="checkbox">
				<span>Remember me</span>
			</label>

			<button type="submit" class="submit-btn">Sign In</button>
		</form>
	</section>
	<section class="right-col">
		<img src="bg.png" alt="Signin visual" draggable="false">
	</section>
</body>
</html>
