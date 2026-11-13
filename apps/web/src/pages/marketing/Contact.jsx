import { GITHUB_URL, ProsePage } from '../../components/layout/MarketingLayout';

function Contact() {
  const link = 'text-accent-text underline';
  return (
    <ProsePage
      title="Contact — Budget Book"
      description="Report a bug, request a feature or ask a question about Budget Book."
      path="/contact"
      heading="Contact"
    >
      <p>Budget Book is developed in the open, so the best place to reach the project is GitHub.</p>
      <h2>Bugs and feature requests</h2>
      <p>
        <a className={link} href={`${GITHUB_URL}/issues`} target="_blank" rel="noreferrer">
          Open an issue
        </a>{' '}
        with the steps to reproduce the problem or a description of what you need.
      </p>
      <h2>Security problems</h2>
      <p>
        Please do not open a public issue. Follow the private reporting steps in{' '}
        <a className={link} href={`${GITHUB_URL}/blob/master/SECURITY.md`} target="_blank" rel="noreferrer">
          SECURITY.md
        </a>
        .
      </p>
    </ProsePage>
  );
}

export default Contact;
