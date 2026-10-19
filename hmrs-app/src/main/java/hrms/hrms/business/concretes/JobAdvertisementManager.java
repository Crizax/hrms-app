package hrms.hrms.business.concretes;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import hrms.hrms.business.abstracts.JobAdvertisementService;
import hrms.hrms.core.utilities.DataResult;
import hrms.hrms.core.utilities.ErrorResult;
import hrms.hrms.core.utilities.Result;
import hrms.hrms.core.utilities.SuccessDataResult;
import hrms.hrms.core.utilities.SuccessResult;
import hrms.hrms.dto.JobAdvertisementDto;
import hrms.hrms.dto.request.CreateJobAdvertisementRequest;
import hrms.hrms.entity.City;
import hrms.hrms.entity.Employer;
import hrms.hrms.entity.JobAdvertisement;
import hrms.hrms.entity.JobPosition;
import hrms.hrms.repository.CityDao;
import hrms.hrms.repository.EmployerDao;
import hrms.hrms.repository.JobAdvertisementDao;
import hrms.hrms.repository.JobPositionDao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import hrms.hrms.dto.PagedResponse;

@Service
public class JobAdvertisementManager implements JobAdvertisementService {

	private final JobAdvertisementDao jobAdvertisementDao;
	private final JobPositionDao jobPositionDao;
	private final CityDao cityDao;
	private final EmployerDao employerDao;

	public JobAdvertisementManager(JobAdvertisementDao jobAdvertisementDao, JobPositionDao jobPositionDao,
								   CityDao cityDao, EmployerDao employerDao) {
		this.jobAdvertisementDao = jobAdvertisementDao;
		this.jobPositionDao = jobPositionDao;
		this.cityDao = cityDao;
		this.employerDao = employerDao;
	}

	@Override
	@Transactional(readOnly = true)
	public DataResult<PagedResponse<JobAdvertisementDto>> search(
			Integer cityId,
			Integer jobPositionId,
			Integer minSalary,
			String keyword,
			int page,
			int size,
			String sortBy,
			String sortDir) {

		int safePage = Math.max(page, 0);
		int safeSize = (size <= 0 || size > 50) ? 10 : size;

		// Allow sorting by releaseDate, applicationDeadline, minSalary, or maxSalary
		String validSortField = switch (sortBy != null ? sortBy : "releaseDate") {
			case "applicationDeadline", "minSalary", "maxSalary", "releaseDate" -> sortBy;
			default -> "releaseDate";
		};

		Sort sort = "asc".equalsIgnoreCase(sortDir)
				? Sort.by(validSortField).ascending()
				: Sort.by(validSortField).descending();

		Pageable pageable = PageRequest.of(safePage, safeSize, sort);

		String trimmedKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;

		Page<JobAdvertisement> adPage = jobAdvertisementDao.searchActiveAds(
				cityId, jobPositionId, minSalary, trimmedKeyword, pageable
		);

		List<JobAdvertisementDto> dtos = adPage.getContent().stream()
				.map(this::toDto)
				.toList();

		PagedResponse<JobAdvertisementDto> pagedResponse = new PagedResponse<>(
				dtos,
				adPage.getNumber(),
				adPage.getSize(),
				adPage.getTotalElements(),
				adPage.getTotalPages(),
				adPage.hasNext()
		);

		return new SuccessDataResult<>(pagedResponse, "Filtered job advertisements listed.");
	}

	@Override
	@Transactional
	public Result add(CreateJobAdvertisementRequest request, Integer authenticatedEmployerId) {
		if (request.getMinSalary() != null && request.getMaxSalary() != null
				&& request.getMinSalary() > request.getMaxSalary()) {
			return new ErrorResult("Min salary cannot be greater than max salary.");
		}

		JobPosition position = jobPositionDao.findById(request.getJobPositionId())
				.orElseThrow(() -> new IllegalArgumentException("Job position not found."));
		City city = cityDao.findById(request.getCityId())
				.orElseThrow(() -> new IllegalArgumentException("City not found."));
		Employer employer = employerDao.findById(authenticatedEmployerId)
				.orElseThrow(() -> new IllegalArgumentException("Employer not found."));

		JobAdvertisement ad = new JobAdvertisement();
		ad.setJobPosition(position);
		ad.setCity(city);
		ad.setEmployer(employer);
		ad.setDescription(request.getDescription());
		ad.setOpenPositionCount(request.getOpenPositionCount());
		ad.setMinSalary(request.getMinSalary());
		ad.setMaxSalary(request.getMaxSalary());
		ad.setReleaseDate(LocalDate.now());
		ad.setApplicationDeadline(request.getApplicationDeadline());
		ad.setActive(true);

		jobAdvertisementDao.save(ad);
		return new SuccessResult("Job advertisement created.");
	}

	@Override
	@Transactional
	public Result deactivate(Integer jobAdvertisementId, Integer authenticatedEmployerId) {
		JobAdvertisement ad = jobAdvertisementDao.findById(jobAdvertisementId)
				.orElseThrow(() -> new IllegalArgumentException("Job advertisement not found."));

		if (!ad.getEmployer().getId().equals(authenticatedEmployerId)) {
			return new ErrorResult("You are not authorized to deactivate this job advertisement.");
		}

		if (!ad.isActive()) {
			return new ErrorResult("Job advertisement is already inactive.");
		}

		ad.setActive(false);
		jobAdvertisementDao.save(ad);
		return new SuccessResult("Job advertisement deactivated.");
	}

	@Override
	@Transactional(readOnly = true)
	public DataResult<List<JobAdvertisementDto>> getAll() {
		var list = jobAdvertisementDao.findAll().stream().map(this::toDto).toList();
		return new SuccessDataResult<>(list, "Job advertisements listed.");
	}

	@Override
	@Transactional(readOnly = true)
	public DataResult<List<JobAdvertisementDto>> getActive() {
		var list = jobAdvertisementDao.findByActiveTrue().stream().map(this::toDto).toList();
		return new SuccessDataResult<>(list, "Active job advertisements listed.");
	}

	@Override
	@Transactional(readOnly = true)
	public DataResult<List<JobAdvertisementDto>> getActiveByEmployer(Integer employerId) {
		var list = jobAdvertisementDao.findByEmployer_IdAndActiveTrue(employerId).stream().map(this::toDto).toList();
		return new SuccessDataResult<>(list, "Employer's active job advertisements listed.");
	}

	@Override
	@Transactional(readOnly = true)
	public DataResult<List<JobAdvertisementDto>> getSortedByDeadlineAsc() {
		var list = jobAdvertisementDao.findAllByOrderByApplicationDeadlineAsc().stream().map(this::toDto).toList();
		return new SuccessDataResult<>(list, "Job advertisements sorted by deadline.");
	}

	@Override
	@Transactional(readOnly = true)
	public DataResult<List<JobAdvertisementDto>> getByDeadline(LocalDate date) {
		var list = jobAdvertisementDao.findByApplicationDeadline(date).stream().map(this::toDto).toList();
		return new SuccessDataResult<>(list, "Job advertisements for given deadline.");
	}

	private JobAdvertisementDto toDto(JobAdvertisement j) {
		return new JobAdvertisementDto(j.getId(), j.getJobPosition().getTitle(), j.getEmployer().getCompanyName(),
				j.getCity().getCityName(), j.getOpenPositionCount(), j.getMinSalary(), j.getMaxSalary(),
				j.getReleaseDate(), j.getApplicationDeadline(), j.isActive());
	}
}