export const pagination = async ({ page, model, populate = [], findby = {},sort = { createdAt: -1 } }) => {
    let _page = +page || 1;  
    if (_page < 1) _page = 1;

    const limit = 8;  
    let skip = (_page - 1) * limit;  

    let data = await model.find(findby).sort(sort) 
        .populate(populate)
        .limit(limit)
        .skip(skip).lean();

    return { data, _page, limit ,total_count:data.length};
};
