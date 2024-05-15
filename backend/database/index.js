import path from 'path';
import mysql from 'mysql2/promise';

const config = {
    host: 'localhost', // DB 주소 (현재는 로컬호스트)
    user: 'root', // DB 계정 이름으로 변경
    password: 'oracle', // DB 계정 비밀번호으로 변경
    database: 'edu_community', // 데이터베이스 이름으로 변경 (교재에서는 edu_community)
    waitForConnections: true,
    port: 3306,
    connectionLimit: 10, // 기본값은 10
};

/* DB Pool 생성 */
const pool = mysql.createPool(config);

/* 쿼리 함수 */
const query = async (queryString, response) => {
    console.log(queryString);
    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            // 트랜잭션 시작
            // await connection.beginTransaction(); // 트랜잭션 사용 시

            const [rows] = await connection.query(queryString);

            // 트랜잭션 커밋
            // await connection.commit(); // 트랜잭션 사용 시

            // 사용 완료된 커넥션 반환
            connection.release();

            return rows;
        } catch (error) {
            // 트랜잭션 롤백
            // 트랜잭션 사용 시
            // await connection.rollback();

            console.error('Query Error');
            console.error(error);

            // 에러 발생 시 커넥션 반환
            connection.release();

            return response.status(500).json({ code: 'Query Error' });
        }
    } catch (error) {
        console.error('DB Error');
        console.error(error);

        return response.status(500).json({ code: 'DB Error' });
    }
};

export { config, pool, query };