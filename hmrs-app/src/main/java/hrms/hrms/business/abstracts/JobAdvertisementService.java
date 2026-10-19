package hrms.hrms.business.abstracts;

import java.time.LocalDate;
import java.util.List;

import hrms.hrms.core.utilities.DataResult;
import hrms.hrms.core.utilities.Result;
import hrms.hrms.dto.JobAdvertisementDto;
import hrms.hrms.dto.PagedResponse;
import hrms.hrms.dto.request.CreateJobAdvertisementRequest;

public interface JobAdvertisementService {

	Result add(CreateJobAdvertisementRequest request, Integer authenticatedEmployerId);

	Result deactivate(Integer jobAdvertisementId, Integer authenticatedEmployerId);

	DataResult<PagedResponse<JobAdvertisementDto>> search(
			Integer cityId,
			Integer jobPositionId,
			Integer minSalary,
			String keyword,
			int page,
			int size,
			String sortBy,
			String sortDir
	);

	DataResult<List<JobAdvertisementDto>> getAll();

	DataResult<List<JobAdvertisementDto>> getActive();

	DataResult<List<JobAdvertisementDto>> getActiveByEmployer(Integer employerId);

	DataResult<List<JobAdvertisementDto>> getSortedByDeadlineAsc();

	DataResult<List<JobAdvertisementDto>> getByDeadline(LocalDate date);
}