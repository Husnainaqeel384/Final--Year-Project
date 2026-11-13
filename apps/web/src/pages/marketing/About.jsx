import { GITHUB_URL, ProsePage } from '../../components/layout/MarketingLayout';

function About() {
  return (
    <ProsePage
      title="About — Budget Book"
      description="Budget Book is an open-source budget management system for individuals and organizations."
      path="/about"
      heading="About Budget Book"
    >
      <p>
        Budget Book began as a university final-year project on budget management and forecasting. It
        has grown into a complete open-source application that anyone can run on their own server.
      </p>
      <h2>What it is for</h2>
      <p>
        Spreadsheets are flexible, but they don't warn you when a category is about to run out or tell
        you where the month is heading. Budget Book gives people and small teams that view without
        handing their financial data to another company.
      </p>
      <h2>Open source</h2>
      <p>
        The code is available under the MIT license. Issues and pull requests are welcome on{' '}
        <a className="text-accent-text underline" href={GITHUB_URL} target="_blank" rel="noreferrer">
          GitHub
        </a>
        .
      </p>
    </ProsePage>
  );
}

export default About;
