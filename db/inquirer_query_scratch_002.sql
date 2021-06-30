USE employee_mgmt;

SELECT CONCAT(m.first_name, ' ', m.last_name, ' (', r.title, ')') AS "full_name"
-- SELECT m.first_name || ' ' || m.last_name || ' - ' || r.title AS "full_name"
FROM (SELECT DISTINCT(s.manager_id)
	  FROM employee s) j
JOIN employee m
	ON j.manager_id = m.id
JOIN role r
	ON r.id = m.role_id
ORDER BY m.last_name;