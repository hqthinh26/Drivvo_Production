const pool = require('./pooling');

module.export = {
    // Step 1: Insert Type:text and uuid_id of that particular form in its private table: like napnhieulieu or chi phi table
    _allformdetail_Insert: async (type_of_form, uuid_of_particular_form) => {
        try{
            if(type_of_form === 'napnhienlieu') {
                console.log('_allformdetail_insert: napnhienlieu');
                await pool.query(`insert into allformdetail (type_of_form, id_nll) 
                values ($1,$2)`, [type_of_form, uuid_of_particular_form]);
                return;
            }
            if (type_of_form === 'chiphi') {
                console.log('_allformdetail_insert: chiphi');
                await pool.query(`insert into allformdetail (type_of_form, id_chiphi)
                values ($1,$2)`, [type_of_form,uuid_of_particular_form])
                return;
            }
            if(type_of_form === 'dichvu') {
                console.log('_allformdetail_insert: dichvu');
                await pool.query(`insert into allformdetail (type_of_form, id_dichvu)
                values ($1,$2)`, [type_of_form,uuid_of_particular_form]);
                return;
            }
            if(type_of_form === 'thunhap') {
                console.log('_allformdetail_insert: thunhap');
                await pool.query(`insert into allformdetail (type_of_form, id_thunhap)
                values ($1,$2)`, [type_of_form, uuid_of_particular_form]);
                return;
            }
            return console.log(`invalid type_of_form: ${type_of_form}`);

        } catch (err) {
            console.log({message: 'failed in allform.js', err});
        }
    },

    _return_id_form_detail: () => {

    }
    //Step 2: Insert the laster expenditure or income of user to the AllTable so that, data is retrieved easily when needed.
    _allform_Insert: async (id_user, id_form_detai, inputFromUser) => {

    }
}