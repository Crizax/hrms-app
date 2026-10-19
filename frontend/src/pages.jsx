import ResourcePage from './ResourcePage'

export function Cities() {
  return (
    <ResourcePage
      title="Cities"
      intro="Locations available for job advertisements. City names must be unique."
      listPath="/api/cities/getAll"
      addPath="/api/cities/add"
      fields={[{ name: 'cityName', label: 'City name', placeholder: 'Karachi' }]}
      columns={[{ label: 'City Name', keys: ['cityName'] }]}
      addTitle="Add a city"
      submitLabel="Add City"
      emptyText="No cities yet. Add one to start posting jobs."
    />
  )
}

export function Employers() {
  return (
    <ResourcePage
      title="Companies Directory"
      intro="Registered organizations publishing job advertisements on the platform."
      listPath="/api/employers/getAll"
      addPath="/api/employers/register"
      fields={[
        { name: 'companyName', label: 'Company name' },
        { name: 'companyWebPage', label: 'Website', placeholder: 'https://' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'phoneNumber', label: 'Phone number', placeholder: '+92-300-1234567' },
        { name: 'password', label: 'Password', type: 'password' },
        { name: 'confirmPassword', label: 'Confirm password', type: 'password' },
      ]}
      columns={[
        { label: 'Company', keys: ['companyName'] },
        { label: 'Website', keys: ['companyWebPage'] },
        { label: 'Email', keys: ['email'] },
        { label: 'Phone', keys: ['phoneNumber'] },
      ]}
      addTitle="Register an employer"
      submitLabel="Register Employer"
      emptyText="No employers registered yet."
    />
  )
}

export function Candidates() {
  return (
    <ResourcePage
      title="Talent Pool"
      intro="Registered job seekers who can apply to open positions."
      listPath="/api/candidateController/getAll"
      addPath="/api/candidateController/register"
      fields={[
        { name: 'name', label: 'First name' },
        { name: 'lastName', label: 'Last name' },
        { name: 'nationalId', label: 'National ID', placeholder: '10–20 digits' },
        { name: 'birthDate', label: 'Date of birth', type: 'date' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'password', label: 'Password', type: 'password' },
        { name: 'confirmPassword', label: 'Confirm password', type: 'password' },
      ]}
      columns={[
        { label: 'Full Name', render: (r) => [r.name, r.lastName].filter(Boolean).join(' ') || '—' },
        { label: 'National ID', keys: ['nationalId'] },
        { label: 'Date of Birth', keys: ['birthDate'] },
        { label: 'Email', keys: ['email'] },
      ]}
      addTitle="Register a candidate"
      submitLabel="Register Candidate"
      emptyText="No candidates registered yet."
    />
  )
}

export function JobPositions() {
  return (
    <ResourcePage
      title="Job Positions"
      intro="Standardized role titles that job advertisements can be published under."
      listPath="/api/jobPosition/getAll"
      addPath="/api/jobPosition/add"
      fields={[{ name: 'title', label: 'Position title', placeholder: 'Full-Stack Software Engineer' }]}
      columns={[{ label: 'Role Title', keys: ['title'] }]}
      addTitle="Add a job position"
      submitLabel="Add Position"
      emptyText="No job positions yet. Add one before posting an advertisement."
    />
  )
}