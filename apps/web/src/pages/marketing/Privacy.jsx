import { ProsePage } from '../../components/layout/MarketingLayout';

function Privacy() {
  return (
    <ProsePage
      title="Privacy — Budget Book"
      description="How Budget Book handles your account and financial data."
      path="/privacy"
      heading="Privacy"
    >
      <p>
        Budget Book is self-hosted software. Whoever runs this installation controls its data and is
        responsible for how it is handled.
      </p>
      <h2>What is stored</h2>
      <p>
        Your name, username, email address and profile picture, the budgets, expenses, transactions,
        reminders and notes you enter, and your organization memberships. Passwords are stored only as
        salted hashes.
      </p>
      <h2>Cookies</h2>
      <p>One essential cookie keeps you signed in. There are no advertising or analytics cookies.</p>
      <h2>Third parties</h2>
      <p>
        Nothing is sent to a third party unless you turn on an integration. Webhooks send event details
        to the address you enter, and calendar or spreadsheet feeds can be read by anyone who has the
        private link.
      </p>
      <h2>Your choices</h2>
      <p>
        You can correct your details from your profile. To remove your account, contact the
        administrator of this installation.
      </p>
    </ProsePage>
  );
}

export default Privacy;
