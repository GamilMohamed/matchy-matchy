
function queryInsertInto(table, columns, values, retvalue) {
	return `INSERT INTO ${table}(${columns.join(', ')}) VALUES(${values.join(', ')}) RETURNING ${retvalue}`;
  }
  
  // Malicious input with SQL injection
  const maliciousEmail = "'); DELETE FROM users; --";
  const insertUser = queryInsertInto('users', ['email', 'age'], [maliciousEmail, 25], 'id');
  
  console.log(insertUser);