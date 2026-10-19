package hrms.hrms.business.concretes;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import hrms.hrms.business.abstracts.JobApplicationService;
import hrms.hrms.core.utilities.DataResult;
import hrms.hrms.core.utilities.ErrorDataResult;
import hrms.hrms.core.utilities.ErrorResult;
import hrms.hrms.core.utilities.Result;
import hrms.hrms.core.utilities.SuccessDataResult;
import hrms.hrms.core.utilities.SuccessResult;
import hrms.hrms.dto.JobApplicationDto;
import hrms.hrms.dto.request.ApplyJobRequest;
import hrms.hrms.dto.request.UpdateApplicationStatusRequest;
import hrms.hrms.entity.JobAdvertisement;
import hrms.hrms.entity.JobApplication;
import hrms.hrms.entity.JobApplicationStatus;
import hrms.hrms.entity.JobSeeker;
import hrms.hrms.repository.JobAdvertisementDao;
import hrms.hrms.repository.JobApplicationDao;
import hrms.hrms.repository.JobSeekerDao;

@Service
public class JobApplicationManager implements JobApplicationService {

	private final JobApplicationDao jobApplicationDao;
	private final JobAdvertisementDao jobAdvertisementDao;
	private final JobSeekerDao jobSeekerDao;

	public JobApplicationManager(JobApplicationDao jobApplicationDao, JobAdvertisementDao jobAdvertisementDao,
								 JobSeekerDao jobSeekerDao) {
		this.jobApplicationDao = jobApplicationDao;
		this.jobAdvertisementDao = jobAdvertisementDao;
		this.jobSeekerDao = jobSeekerDao;
	}

	@Override
	@Transactional
	public Result apply(ApplyJobRequest request, Integer authenticatedSeekerId) {
		JobAdvertisement ad = jobAdvertisementDao.findById(request.getJobAdvertisementId())
				.orElseThrow(() -> new IllegalArgumentException("Job advertisement not found."));

		if (!ad.isActive()) {
			return new ErrorResult("Job advertisement is not active.");
		}

		if (ad.getApplicationDeadline().isBefore(LocalDate.now())) {
			ad.setActive(false);
			jobAdvertisementDao.save(ad);
			return new ErrorResult("The application deadline for this job has passed.");
		}

		JobSeeker seeker = jobSeekerDao.findById(authenticatedSeekerId)
				.orElseThrow(() -> new IllegalArgumentException("Job seeker not found."));

		if (jobApplicationDao.findByJobAdvertisement_IdAndJobSeeker_Id(ad.getId(), seeker.getId()).isPresent()) {
			return new ErrorResult("You have already applied to this advertisement.");
		}

		JobApplication app = new JobApplication();
		app.setJobAdvertisement(ad);
		app.setJobSeeker(seeker);
		app.setStatus(JobApplicationStatus.PENDING);

		jobApplicationDao.save(app);
		return new SuccessResult("Application submitted.");
	}

	@Override
	@Transactional
	public Result updateStatus(UpdateApplicationStatusRequest request, Integer authenticatedEmployerId) {
		JobApplication app = jobApplicationDao.findById(request.getApplicationId())
				.orElseThrow(() -> new IllegalArgumentException("Application not found."));

		JobAdvertisement ad = app.getJobAdvertisement();
		if (!ad.getEmployer().getId().equals(authenticatedEmployerId)) {
			return new ErrorResult("You are not authorized to update applications for another company's job post.");
		}

		app.setStatus(request.getStatus());
		jobApplicationDao.save(app);

		// Auto-close the job ad if all open positions are now filled
		if (request.getStatus() == JobApplicationStatus.ACCEPTED) {
			long acceptedCount = jobApplicationDao.findByJobAdvertisement_Id(ad.getId()).stream()
					.filter(a -> a.getStatus() == JobApplicationStatus.ACCEPTED)
					.count();
			if (acceptedCount >= ad.getOpenPositionCount()) {
				ad.setActive(false);
				jobAdvertisementDao.save(ad);
			}
		}

		return new SuccessResult("Application status updated.");
	}

	@Override
	@Transactional(readOnly = true)
	public DataResult<List<JobApplicationDto>> getByAdvertisement(Integer jobAdvertisementId, Integer authenticatedEmployerId) {
		JobAdvertisement ad = jobAdvertisementDao.findById(jobAdvertisementId)
				.orElseThrow(() -> new IllegalArgumentException("Job advertisement not found."));

		if (!ad.getEmployer().getId().equals(authenticatedEmployerId)) {
			return new ErrorDataResult<>("You are not authorized to view applications for this job advertisement.");
		}

		var list = jobApplicationDao.findByJobAdvertisement_Id(jobAdvertisementId).stream()
				.map(this::toDto)
				.toList();
		return new SuccessDataResult<>(list, "Applications listed for advertisement.");
	}

	@Override
	@Transactional(readOnly = true)
	public DataResult<List<JobApplicationDto>> getByJobSeeker(Integer authenticatedSeekerId) {
		var list = jobApplicationDao.findByJobSeeker_Id(authenticatedSeekerId).stream()
				.map(this::toDto)
				.toList();
		return new SuccessDataResult<>(list, "Applications listed for job seeker.");
	}

	private JobApplicationDto toDto(JobApplication a) {
		return new JobApplicationDto(
				a.getId(),
				a.getJobAdvertisement().getId(),
				a.getJobSeeker().getId(),
				a.getJobSeeker().getName(),
				a.getJobSeeker().getLastName(),
				a.getJobSeeker().getEmail(),
				a.getJobAdvertisement().getJobPosition().getTitle(),
				a.getJobAdvertisement().getEmployer().getCompanyName(),
				a.getApplicationDate(),
				a.getStatus()
		);
	}
}