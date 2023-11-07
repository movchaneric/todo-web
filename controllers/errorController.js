exports.error404 = (req, res, next) => {
    res.status(404).render('../views/404',
     {
        pageTitle: 'Page Not Found'
    });
};

//server side error
exports.error500 = (req, res, next) => {
    console.log('inside error500')
    res.status(500).render('../views/500', {
        pageTitle: '500 Error'
    })
}