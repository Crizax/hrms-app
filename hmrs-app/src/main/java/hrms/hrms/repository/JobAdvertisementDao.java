package hrms.hrms.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import hrms.hrms.entity.JobAdvertisement;

public interface JobAdvertisementDao extends JpaRepository<JobAdvertisement, Integer> {

	List<JobAdvertisement> findByActiveTrue();

	List<JobAdvertisement> findByEmployer_IdAndActiveTrue(Integer employerId);

	List<JobAdvertisement> findAllByOrderByApplicationDeadlineAsc();

	@Query("select j from JobAdvertisement j where j.applicationDeadline = :deadline")
	List<JobAdvertisement> findByApplicationDeadline(@Param("deadline") LocalDate deadline);

	@EntityGraph(attributePaths = {"jobPosition", "city", "employer"})
	@Query("""
		SELECT j FROM JobAdvertisement j
		WHERE j.active = true
		  AND j.applicationDeadline >= CURRENT_DATE
		  AND (:cityId IS NULL OR j.city.id = :cityId)
		  AND (:jobPositionId IS NULL OR j.jobPosition.id = :jobPositionId)
		  AND (:minSalary IS NULL OR j.maxSalary >= :minSalary OR j.minSalary >= :minSalary)
		  AND (:keyword IS NULL OR :keyword = ''
		       OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
		       OR LOWER(j.jobPosition.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
		       OR LOWER(j.employer.companyName) LIKE LOWER(CONCAT('%', :keyword, '%')))
	""")
	Page<JobAdvertisement> searchActiveAds(
			@Param("cityId") Integer cityId,
			@Param("jobPositionId") Integer jobPositionId,
			@Param("minSalary") Integer minSalary,
			@Param("keyword") String keyword,
			Pageable pageable
	);
}