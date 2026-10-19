package hrms.hrms.core.security;

import java.util.Optional;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import hrms.hrms.entity.Employer;
import hrms.hrms.entity.JobSeeker;
import hrms.hrms.repository.EmployerDao;
import hrms.hrms.repository.JobSeekerDao;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final EmployerDao employerDao;
    private final JobSeekerDao jobSeekerDao;

    public CustomUserDetailsService(EmployerDao employerDao, JobSeekerDao jobSeekerDao) {
        this.employerDao = employerDao;
        this.jobSeekerDao = jobSeekerDao;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<Employer> employer = employerDao.findByEmail(email);
        if (employer.isPresent()) {
            Employer e = employer.get();
            return new CustomUserDetails(e.getId(), e.getEmail(), e.getPassword(), "ROLE_EMPLOYER");
        }

        Optional<JobSeeker> seeker = jobSeekerDao.findByEmail(email);
        if (seeker.isPresent()) {
            JobSeeker js = seeker.get();
            return new CustomUserDetails(js.getId(), js.getEmail(), js.getPassword(), "ROLE_JOBSEEKER");
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }
}