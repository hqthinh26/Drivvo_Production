const pool = require('../database/pooling');

const return_n_rows_nll = async (usr_id) => { 
    try {
        const query1 = await pool.query(`
        SELECT id ,date, time, odometer, total_units
        FROM napnhienlieu
        WHERE u_id = $1
        ORDER BY date asc, time asc
        LIMIT 10
        `, [usr_id]);
        const all_rows = query1.rows;
        return {number: query1.rowCount, all_rows};
    } catch (err) {
        throw new Error(err);
    }
}

const loop_throght_map = (current_value, index, arr) => {
    if(index != (arr.length -1)) {
        const odometer_diff = arr[index + 1].odometer - arr[index].odometer;
        const average_km_l = odometer_diff / current_value.total_units;
        return {
            id: current_value.id, 
            average_km_l, 
        };
    }
    return ({
        id: current_value.id,
        average_km_l: 0,
    });
}

const count_average_km_l = (array_of_nll_rows) => {
    const average_array = array_of_nll_rows.map(loop_throght_map);

    //each_value = {id, average_km}
    const final = average_array.map((each_value) => ({
        ...each_value,
        average_km_l: parseFloat(each_value.average_km_l.toFixed(3)),
    }));
    return final;
}

module.exports = {
    average_nll_each_form: async (usr_id) => {
        const {number, all_rows} = await return_n_rows_nll(usr_id);
        const array_of_nll_rows2 = all_rows.map(
            (each_one) => ({
                ...each_one, 
                total_units: parseFloat(each_one.total_units),
                odometer: parseFloat(each_one.odometer),
            })
        );
        const average = count_average_km_l(array_of_nll_rows2);

        //Fuel Efficiency

        const array_of_average_only = average.map((each_value) => each_value.average_km_l);
        
        const descending = array_of_average_only.sort(function(a, b){return b-a});
        const max = descending[0];
        
        const ascending = array_of_average_only.sort(function(a,b){return a-b});
        const min = ascending[1];
        
        const last = array_of_average_only[(array_of_average_only.length) -2];
        
        return {number_of_rows: number, array_of_nll_rows2, average, last, max, min};
    },
}



/*const return_average = (form_id) => {

    const array_test = [];
    const founded =  array_test.find( (each_value) => {
        return each_value.id === form_id;
    });
    if (founded === undefined) return null;
    return founded.average_km_l;
}*/

// get_average = {this.return_average}