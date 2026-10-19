package hrms.hrms.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import hrms.hrms.business.abstracts.JobAdvertisementService;
import hrms.hrms.core.security.CustomUserDetails;
import hrms.hrms.core.utilities.DataResult;
import hrms.hrms.core.utilities.Result;
import hrms.hrms.dto.JobAdvertisementDto;
import hrms.hrms.dto.request.CreateJobAdvertisementRequest;
import jakarta.validation.Valid;
import hrms.hrms.dto.PagedResponse;

@RestController
@RequestMapping("/api/jobPost")
public class JobAdvertisementController {

	private final JobAdvertisementService jobAdvertisementService;

	public JobAdvertisementController(JobAdvertisementService jobAdvertisementService) {
		this.jobAdvertisementService = jobAdvertisementService;
	}

	@PostMapping("/add")
	public Result add(
			@Valid @RequestBody CreateJobAdvertisementRequest request,
			@AuthenticationPrincipal CustomUserDetails currentUser) {
		return jobAdvertisementService.add(request, currentUser.getId());
	}

	@PutMapping("/{id}/deactivate")
	public Result deactivate(
			@PathVariable("id") Integer id,
			@AuthenticationPrincipal CustomUserDetails currentUser) {
		return jobAdvertisementService.deactivate(id, currentUser.getId());
	}

	@GetMapping("/search")
	public DataResult<PagedResponse<JobAdvertisementDto>> search(
			@RequestParam(required = false) Integer cityId,
			@RequestParam(required = false) Integer jobPositionId,
			@RequestParam(required = false) Integer minSalary,
			@RequestParam(required = false) String keyword,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(defaultValue = "releaseDate") String sortBy,
			@RequestParam(defaultValue = "desc") String sortDir) {

		return jobAdvertisementService.search(
				cityId, jobPositionId, minSalary, keyword, page, size, sortBy, sortDir
		);
	}

	@GetMapping("/getAll")
	public DataResult<List<JobAdvertisementDto>> getAll() {
		return jobAdvertisementService.getAll();
	}

	@GetMapping("/active")
	public DataResult<List<JobAdvertisementDto>> getActive() {
		return jobAdvertisementService.getActive();
	}

	@GetMapping("/active/by-employer")
	public DataResult<List<JobAdvertisementDto>> getActiveByEmployer(@RequestParam Integer employerId) {
		return jobAdvertisementService.getActiveByEmployer(employerId);
	}

	@GetMapping("/sorted-by-deadline")
	public DataResult<List<JobAdvertisementDto>> getSortedByDeadlineAsc() {
		return jobAdvertisementService.getSortedByDeadlineAsc();
	}

	@GetMapping("/by-deadline")
	public DataResult<List<JobAdvertisementDto>> getByDeadline(@RequestParam LocalDate date) {
		return jobAdvertisementService.getByDeadline(date);
	}
}