package hrms.hrms.business.abstracts;

import java.util.List;

import hrms.hrms.core.utilities.DataResult;
import hrms.hrms.core.utilities.Result;
import hrms.hrms.dto.JobApplicationDto;
import hrms.hrms.dto.request.ApplyJobRequest;
import hrms.hrms.dto.request.UpdateApplicationStatusRequest;

public interface JobApplicationService {

	Result apply(ApplyJobRequest request, Integer authenticatedSeekerId);

	Result updateStatus(UpdateApplicationStatusRequest request, Integer authenticatedEmployerId);

	DataResult<List<JobApplicationDto>> getByAdvertisement(Integer jobAdvertisementId, Integer authenticatedEmployerId);

	DataResult<List<JobApplicationDto>> getByJobSeeker(Integer authenticatedSeekerId);
}