import ResourcePage from './ResourcePage'

export function Cities() {
  return (
    <ResourcePage
      title="Cities" intro="Locations available for job advertisements. City names must be unique."
      listPath="/api/cities/getAll" addPath="/api/cities/add"
      fields={[{ name: 'cityName', label: 'City name', placeholder: 'Istanbul' }]}
      columns={[{ label: 'Name', keys: ['cityName'] }]}
      addTitle="Add a city" submitLabel="Add city" emptyText="No cities yet. Add one to start posting jobs."
    />
  )
}

export function Employers() {
  return (
    <ResourcePage
      title="Employers" intro="Companies that publish job advertisements."
      listPath="/api/employers/getAll" addPath="/api/employers/register"
      fields={[
        { name: 'companyName', label: 'Company name' },
        { name: 'companyWebPage', label: 'Website', placeholder: 'https://' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'phoneNumber', label: 'Phone number', placeholder: '+90-555-123-4567' },
        { name: 'password', label: 'Password', type: 'password' },
        { name: 'confirmPassword', label: 'Confirm password', type: 'password' },
      ]}
      columns={[
        { label: 'Company', keys: ['companyName'] },
        { label: 'Website', keys: ['companyWebPage'] },
        { label: 'Email', keys: ['email'] },
        { label: 'Phone', keys: ['phoneNumber'] },
      ]}
      addTitle="Register an employer" submitLabel="Register employer" emptyText="No employers registered yet."
    />
  )
}

export function Candidates() {
  return (
    <ResourcePage
      title="Candidates" intro="Job seekers who can apply to advertisements."
      listPath="/api/candidateController/getAll" addPath="/api/candidateController/register"
      fields={[
        { name: 'name', label: 'First name' },
        { name: 'lastName', label: 'Last name' },
        { name: 'nationalId', label: 'National ID', placeholder: '11 digits' },
        { name: 'birthDate', label: 'Date of birth', type: 'date' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'password', label: 'Password', type: 'password' },
        { name: 'confirmPassword', label: 'Confirm password', type: 'password' },
      ]}
      columns={[
        { label: 'Name', render: (r) => [r.name, r.lastName].filter(Boolean).join(' ') || '—' },
        { label: 'National ID', keys: ['nationalId'] },
        { label: 'Date of birth', keys: ['birthDate'] },
        { label: 'Email', keys: ['email'] },
      ]}
      addTitle="Register a candidate" submitLabel="Register candidate" emptyText="No candidates registered yet."
    />
  )
}

export function JobPositions() {
  return (
    <ResourcePage
      title="Job positions" intro="Role titles that job advertisements can be posted under."
      listPath="/api/jobPosition/getAll" addPath="/api/jobPosition/add"
      fields={[{ name: 'title', label: 'Position title', placeholder: 'Java Backend Developer' }]}
      columns={[{ label: 'Title', keys: ['title'] }]}
      addTitle="Add a job position" submitLabel="Add position" emptyText="No job positions yet. Add one before posting an advertisement."
    />
  )
}
