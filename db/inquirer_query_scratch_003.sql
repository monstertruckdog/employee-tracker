USE employee_mgmt;

SELECT
	r.id AS "Role ID",
	r.title AS "Role Title Name",
	r.salary AS "Role Salary (USD)",
	r.department_id AS "Department ID",
    d.name AS "Department Name"
FROM role r
JOIN department d
  ON r.department_id = d.id
ORDER BY r.id ASC;