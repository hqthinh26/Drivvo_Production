const fetch = require('node-fetch');

// fetch('https://docker-compose-only.herokuapp.com/nhacnho/insert', {
//     method: 'POST',
//     headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//         Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZoYXExNTI4IiwicHciOiJxd2VyMTIzNCIsImlhdCI6MTU5ODU5MDc5N30.BZkohjicidTNz14BmVkBkbZuXFAuJ6Ifvw3YS13XiRM`,
//     },
//     body: JSON.stringify({
//         type_of_expense: 'false',
//         type_of_service: true,
//         name_of_nhacnho: 'quoc thinh nhac nho test 15',
//         is_one_time: true,
//         OT_at_odometer: 2000,
//         OT_at_date: '2020-08-28',
//         RR_at_km_range: 50,
//         RR_period: '2 month',
//     }),
// })
// .then(result => result.json())
// .then(result => console.log(result.message))
// .catch(err => console.log(err));



// fetch('http://172.17.175.18:3000/nhacnho/insert', {
//     method: 'POST',
//     headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//         Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imh1eW5oMjZAZ21haWwuY29tIiwicHciOiIxOTk4IiwiaWF0IjoxNTk4MTcwNDI1fQ.UF9GDuEdCUspLOI6O9XeAXhXR9ii0heDH9z8dbZuU78`,
//     },
//     body: JSON.stringify({
//         type_of_expense: 'false',
//         type_of_service: true,
//         name_of_nhacnho: 'quoc thinh nhac nho test 20',
//         is_one_time: true,
//         OT_at_odometer: 2000,
//         OT_at_date: '2020-08-28',
//         RR_at_km_range: 50,
//         RR_period: '2 month',
//     }),
// })
// .then(result => result.json())
// .then(result => console.log(result.message))
// .catch(err => console.log(err));

fetch('http://172.17.175.18:3000/nhacnho/print', {
    method: 'GET',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imh1eW5oMjZAZ21haWwuY29tIiwicHciOiIxOTk4IiwiaWF0IjoxNTk4MTcwNDI1fQ.UF9GDuEdCUspLOI6O9XeAXhXR9ii0heDH9z8dbZuU78`,
    },
})
.then(result => result.json())
.then(result => console.table(result.table))
.catch(err => console.log(err));