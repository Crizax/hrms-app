package hrms.hrms.business.concretes;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import hrms.hrms.business.abstracts.EmployerService;
import hrms.hrms.core.utilities.DataResult;
import hrms.hrms.core.utilities.ErrorResult;
import hrms.hrms.core.utilities.Result;
import hrms.hrms.core.utilities.SuccessDataResult;
import hrms.hrms.core.utilities.SuccessResult;
import hrms.hrms.dto.EmployerDto;
import hrms.hrms.dto.request.EmployerRegisterRequest;
import hrms.hrms.entity.Employer;
import hrms.hrms.repository.EmployerDao;
import hrms.hrms.repository.JobSeekerDao; // <-- 1. Import JobSeekerDao

@Service
public class EmployerManager implements EmployerService {

	private final EmployerDao employerDao;
	private final JobSeekerDao jobSeekerDao; // <-- 2. Add field
	private final PasswordEncoder passwordEncoder;

	// 3. Inject JobSeekerDao in constructor
	public EmployerManager(EmployerDao employerDao, JobSeekerDao jobSeekerDao, PasswordEncoder passwordEncoder) {
		this.employerDao = employerDao;
		this.jobSeekerDao = jobSeekerDao;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public Result register(EmployerRegisterRequest request) {
		if (!request.getPassword().equals(request.getConfirmPassword())) {
			return new ErrorResult("Passwords do not match.");
		}
		// 4. Check BOTH tables for the email
		if (employerDao.findByEmail(request.getEmail()).isPresent()
				|| jobSeekerDao.findByEmail(request.getEmail()).isPresent()) {
			return new ErrorResult("Email is already in use.");
		}

		Employer e = new Employer();
		e.setCompanyName(request.getCompanyName());
		e.setCompanyWebPage(request.getCompanyWebPage());
		e.setEmail(request.getEmail());
		e.setPhoneNumber(request.getPhoneNumber());
		e.setPassword(passwordEncoder.encode(request.getPassword()));
		employerDao.save(e);

		return new SuccessResult("Employer registered.");
	}

	@Override
	public DataResult<List<EmployerDto>> getAll() {
		var list = employerDao.findAll().stream().map(e -> new EmployerDto(e.getId(), e.getCompanyName(),
				e.getCompanyWebPage(), e.getEmail(), e.getPhoneNumber())).toList();
		return new SuccessDataResult<>(list, "Employers listed.");
	}
}