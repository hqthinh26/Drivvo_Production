const pool = require('../database/pooling');
const { idleCount } = require('../database/pooling');

const total_each_type = async (type_array, usr_id) => {
    return Promise.all(
        type_array.map((each_row) => {
            if(each_row === 'napnhienlieu') {
                return pool.query(`
                SELECT sum(total_cost) as total FROM napnhienlieu WHERE u_id = $1`,[usr_id]);
            }
            if(each_row === 'chiphi') {
                return pool.query(`
                SELECT sum(amount) as total FROM chiphi WHERE u_id = $1`,[usr_id]);
            }
            if(each_row === 'dichvu') {
                return pool.query(`
                SELECT sum(amount) as total FROM dichvu WHERE u_id = $1`,[usr_id]);
            }
        })
    );
}

module.exports = {
    chart_1: async (usr_id) => {
        const type_array = ['napnhienlieu', 'chiphi', 'dichvu'];

        // The function below is the most important 
        const big_one = await total_each_type(type_array, usr_id);

       const final_result = big_one.map(
           (each_type, index) => ({
              type_of_cost: type_array[index], 
              total: parseInt(each_type.rows[0].total),
           })
       );
       return final_result;
    }
}