import mysql from 'mysql2/promise'; // Use mysql2 for promise support

// Create a MySQL connection pool for the main database
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Thub@1234', // Replace with your actual password
    waitForConnections: true,
    connectionLimit: 1000,
    queueLimit: 0,
});

// Helper function to create a new database for the user
const createDatabaseForUser = async (userId) => {
    const dbName = `db_${userId}`; // Create a unique database name based on the user ID
    try {
        // Check if the database already exists
        const [rows] = await pool.execute(`SHOW DATABASES LIKE '${dbName}'`);
        if (rows.length === 0) {
            // If the database doesn't exist, create it
            await pool.execute(`CREATE DATABASE ${dbName}`);
        }
        return dbName;
    } catch (error) {
        console.error('Error creating database for user:', error);
        throw error;
    }
};

// Function to execute SQL query
const executeSQLQuery = async (req, res) => {
    const { code, values, userId } = req.body; // Get SQL query, values, and user ID from request body

    // Check if the SQL query contains `CREATE DATABASE` to block it
    if (/CREATE DATABASE/i.test(code)) {
        return res.status(403).json({
            success: false,
            message: 'You are not allowed to create a new database.',
        });
    }

    if (/DROP DATABASE/i.test(code)) {
        return res.status(403).json({
            success: false,
            message: 'You are not allowed to DELETE a database.',
        });
    }

    if (/SHOW DATABASES/i.test(code)) {
        return res.status(403).json({
            success: false,
            message: 'You are not allowed to RUN THIS COMMAND!',
        });
    }

    try {
        // Create a new database for the user if it doesn't already exist
        const userDatabase = await createDatabaseForUser(userId);

        // Create a new connection to the user's specific database
        const userPool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: 'Thub@1234', // Replace with your actual password
            database: userDatabase, // Use the user's database
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });

        // Execute the SQL query in the user's database
        const [rows] = await userPool.execute(code, values);

        // Send the result back to the client
        res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({
            success: false,
            message: 'Error executing SQL query',
            error: error.message,
        });
    }
};

export default executeSQLQuery;
