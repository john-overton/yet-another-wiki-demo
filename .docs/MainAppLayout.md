# Main App Layout

### Login Page
The login page should be a panel with three buttons:

 - Email
 - Microsoft (SSO) - use your Microsoft Account
 - Google (SSO) - use your Google Account

Something like this and with the additional SSO buttons but not exactly like this style:

HTML:
```HTML
<div class="login">
  <h1>Login to Web App</h1>
  <form method="post" action="">
    <p><input type="text" name="login" value="" placeholder="Username or Email"></p>
    <p><input type="password" name="password" value="" placeholder="Password"></p>
    <p class="remember_me">
      <label>
        <input type="checkbox" name="remember_me" id="remember_me">
        Remember me on this computer
      </label>
    </p>
    <p class="submit"><input type="submit" name="commit" value="Login"></p>
  </form>
</div>

<div class="login-help">
  <p>Forgot your password? <a href="#">Click here to reset it</a>.</p>
</div>

```
CSS:
```CSS
body {
  font: 13px/20px "Lucida Grande", Tahoma, Verdana, sans-serif;
  color: #404040;
  background: #0ca3d2;
}

.login {
  position: relative;
  margin: 30px auto;
  padding: 20px 20px 20px;
  width: 310px;
  background: white;
  border-radius: 3px;
  -webkit-box-shadow: 0 0 200px rgba(255, 255, 255, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0 0 200px rgba(255, 255, 255, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3);
}

.login:before {
  content: '';
  position: absolute;
  top: -8px;
  right: -8px;
  bottom: -8px;
  left: -8px;
  z-index: -1;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
}

.login h1 {
  margin: -20px -20px 21px;
  line-height: 40px;
  font-size: 15px;
  font-weight: bold;
  color: #555;
  text-align: center;
  text-shadow: 0 1px white;
  background: #f3f3f3;
  border-bottom: 1px solid #cfcfcf;
  border-radius: 3px 3px 0 0;
  background-image: -webkit-linear-gradient(top, whiteffd, #eef2f5);
  background-image: -moz-linear-gradient(top, whiteffd, #eef2f5);
  background-image: -o-linear-gradient(top, whiteffd, #eef2f5);
  background-image: linear-gradient(to bottom, whiteffd, #eef2f5);
  -webkit-box-shadow: 0 1px whitesmoke;
  box-shadow: 0 1px whitesmoke;
}

.login p {
  margin: 20px 0 0;
}

.login p:first-child {
  margin-top: 0;
}

.login input[type=text], .login input[type=password] {
  width: 278px;
}

.login p.remember_me {
  float: left;
  line-height: 31px;
}

.login p.remember_me label {
  font-size: 12px;
  color: #777;
  cursor: pointer;
}

.login p.remember_me input {
  position: relative;
  bottom: 1px;
  margin-right: 4px;
  vertical-align: middle;
}

.login p.submit {
  text-align: right;
}

.login-help {
  margin: 20px 0;
  font-size: 11px;
  color: white;
  text-align: center;
  text-shadow: 0 1px #2a85a1;
}

.login-help a {
  color: #cce7fa;
  text-decoration: none;
}

.login-help a:hover {
  text-decoration: underline;
}

:-moz-placeholder {
  color: #c9c9c9 !important;
  font-size: 13px;
}

::-webkit-input-placeholder {
  color: #ccc;
  font-size: 13px;
}

input {
  font-family: 'Lucida Grande', Tahoma, Verdana, sans-serif;
  font-size: 14px;
}

input[type=text], input[type=password] {
  margin: 5px;
  padding: 0 10px;
  width: 200px;
  height: 34px;
  color: #404040;
  background: white;
  border: 1px solid;
  border-color: #c4c4c4 #d1d1d1 #d4d4d4;
  border-radius: 2px;
  outline: 5px solid #eff4f7;
  -moz-outline-radius: 3px;
  -webkit-box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.12);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.12);
}

input[type=text]:focus, input[type=password]:focus {
  border-color: #7dc9e2;
  outline-color: #dceefc;
  outline-offset: 0;
}

input[type=submit] {
  padding: 0 18px;
  height: 29px;
  font-size: 12px;
  font-weight: bold;
  color: #527881;
  text-shadow: 0 1px #e3f1f1;
  background: #cde5ef;
  border: 1px solid;
  border-color: #b4ccce #b3c0c8 #9eb9c2;
  border-radius: 16px;
  outline: 0;
  -webkit-box-sizing: content-box;
  -moz-box-sizing: content-box;
  box-sizing: content-box;
  background-image: -webkit-linear-gradient(top, #edf5f8, #cde5ef);
  background-image: -moz-linear-gradient(top, #edf5f8, #cde5ef);
  background-image: -o-linear-gradient(top, #edf5f8, #cde5ef);
  background-image: linear-gradient(to bottom, #edf5f8, #cde5ef);
  -webkit-box-shadow: inset 0 1px white, 0 1px 2px rgba(0, 0, 0, 0.15);
  box-shadow: inset 0 1px white, 0 1px 2px rgba(0, 0, 0, 0.15);
}

input[type=submit]:active {
  background: #cde5ef;
  border-color: #9eb9c2 #b3c0c8 #b4ccce;
  -webkit-box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.2);
}

.lt-ie9 input[type=text], .lt-ie9 input[type=password] {
  line-height: 34px;
}
```

## User Interface

The main user interface should be split into the 4 div's broken up into two categories: **Header** and **Main App.**

#### Header
**Div 1** is the header, and should span the top of the page completely.  This should contain the following:
 - Left: A logo for the application, takes the user to the home screen which is the starting page of the main app
 - Left: A drop down of all orgs which will impact the view for the other 3 divs below
 - Middle: A search bar
 - Right: Notifications - this tells you anytime someone has @mentioned you, or a section of a RFP is updated that you follow
 -  Right: Account button that has a dropdown menu for user "My Account - which shows the users name, Settings (if the user is an admin and will take the user to the admin page), and Logout

#### Main App

**Div 2** is a menu on the left with the following functionality (10% size):

 - Shows a list of all items in the department or company (depending on the relationship the user has to the org and sub OU's) which a user can click on to affect the other divs in the main screen
 - Has a button to add new folders or RFP's

**Div 3** is the main RFP box and contains several tabs (70% size)

 - Files is the first tab
	 - This opens the view up into two separate divs, 1 a list of RFP attachments, and the second div is the rendering of the documents (PDF's to start)
 - Summary is the second tab
	 - This view contains high level details about the RFP, approximate value, schedule, answers to good fit questions, and a high level analysis of whether or not this may be a good fit on a simple grading of 1-4 (1 being the lowest and worst fit, 4 being the company hits every requirement and is the guardrails for new business)
 - Voting is the next tab
	- This tab is where decision makers decide go\no-go.  If you are an admin or a part of procurement you can trigger voting at any time and set due date for voting
 - The next tab is Questions
	 - There should be two views in the this tab.  One for known questions, and the other for unknown questions.  This is tab contains a list of all questions about the RFP - the base set of questions will be derived from the fit set during on boarding questions.
	 - Users can answer questions, or questions can be answered by attached amendments, or RFP agency answers to questions.
 - The final tab is Review
	- This tab is where you can review your response grading against the RFP

**Div 4** is the comments sections and on the right of the screen (20% size)

 - The comments section is a full historical record of the updates, changes, and user comments of the RFP.
 - Based on the tab open the comments are filtered for that specific section.
 - Comments utilize MD formatting
 - There should be a button or switch at the top of the comment page that shows you all comment history without Div 3 tab filters applied.

#### Settings
If the user is an admin or manages a department the user should see settings for that department.  These settings include

 - Configuration of the department or sub company
	 - Set the industry
	 - Set the onboard questions (what questions do you always ask for each RFP you bid on)
	 - Upload sample summaries (pdf, text, word, images) relevant to the business
		 - **NOTE** all of these settings impact the API calls to the AI service when the app is creating summaries.
 - Billing and Payments
	 - page to set subscription level (company or sub company level)
	 - change billing payment methods
	 - close or cancel the account
	 - view to see usage for company or sub company (grouped by department)