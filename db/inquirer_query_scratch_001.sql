USE employee_mgmt;

SELECT
	e.id,
    CONCAT(e.first_name, ' ', e.last_name) AS "Employee Name",
    e.role_id AS "Role ID",
    r.title AS "Role Desc",
    IFNULL(e.manager_id, 'NA') AS "Manager ID",
    IFNULL(CONCAT(m.first_name, ' ', m.last_name), '(No assigned Manager)') AS "Manager Desc"
FROM employee e
JOIN role r
  ON e.role_id = r.id
LEFT JOIN employee m
  ON e.manager_id = m.id;