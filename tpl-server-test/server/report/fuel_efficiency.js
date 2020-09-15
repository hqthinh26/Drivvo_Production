const pool = require('../database/pooling');

//Return all nll rows
const return_all_nll_rows = async (usr_id) => {
    try {
        const query1 = await pool.query(`
        SELECT id, date, time, odometer, total_units
        FROM napnhienlieu
        WHERE u_id = $1
        ORDER BY date asc, time asc
        `, [usr_id]);
        const nll_rows = query1.rows;
        return nll_rows;
    } catch (err) {
        throw new Error('failed at return_all_nll_rows');
    }
}

const nll_rows_without_timestamp = (array_with_timestamp) => {
    const result_array = array_with_timestamp.map( (each_row) => ({
        id: each_row.id,
        odometer: parseFloat(each_row.odometer),
        total_units: parseFloat(each_row.total_units)
    }));
    return result_array;
}

const loop_through_function = (each_row, index, array) => {
    if(index != array.length -1){
        const average = parseFloat(((array[index +1].odometer - array[index].odometer)/ array[index].total_units).toFixed(3));
        return ({
            id: each_row.id,
            average,
        })
    }
    else {
        return ({
            id: each_row.id,
            average: 0.000,
        })
    }
}


// nll_rows = [{id, odometer, total_units}, {}, {}, ...]
const average_nll_array = (nll_rows) => {
    // the function inside map method will loop through each row and calculate
    const result_array = nll_rows.map(loop_through_function);
    return result_array;
}

const find_min_and_max = (average_array) => {
    let min = average_array[0], max = average_array[0];
    
    //Phan tu cuoi cung cua mang chua co trung binh nen loai ra
    for(let i = 0; i < average_array.length -1; i++) {
        const current_i = average_array[i];
        if(average_array[i].average < min.average ) min = average_array[i];
        if(average_array[i].average > max.average ) max = average_array[i];
    }
    return {min, max}
}

module.exports = { 
    print_fuel_efficiency:  async (usr_id) => {

        try {
            const nll_rows_with_timestamp = await return_all_nll_rows(usr_id);

            const all_rows_without_timestamp = nll_rows_without_timestamp(nll_rows_with_timestamp);

            const average_array = average_nll_array(all_rows_without_timestamp);

            if (average_array.length <2) {
                return {
                    all_rows_without_timestamp, 
                    average_array, 
                    latest: average_array.length === 0 
                        ? {id: 'ZERO NLL FORM', average: 0.000}
                        : {id: average_array[0].id, average: 0.000}, 
                    min: average_array.length === 0 
                        ? {id: 'ZERO NLL FORM', average: 0.000}
                        : {id: average_array[0].id, average: 0.000}, 
                    max: average_array.length === 0 
                        ? {id: 'ZERO NLL FORM', average: 0.000}
                        : {id: average_array[0].id, average: 0.000}
                };
            } else {
                const latest = average_array[average_array.length -2];
                const {min, max} = find_min_and_max(average_array);
                return {all_rows_without_timestamp, average_array, latest, min, max};
            }            
        } catch (err) {
            throw new Error(err);
        }
    },

}