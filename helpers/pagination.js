const _exports = {};

_exports.parseLimit = (limit, _default = 25) => {
    limit = parseInt(limit);
    return !isNaN(limit) && limit > 0 ? limit : _default;
}

_exports.parseOffset = offset => {
    offset = parseInt(offset);
    return !isNaN(offset) ? offset : 0;
}

_exports.createBaseUrl = (req, current_route = '') => {
    return `${req.protocol}://${req.hostname}:${process.env.PORT || PORT}` + current_route;
}

_exports.createNextUrl = (base_url, query, offset, limit, max_documents) => {
    if (offset + limit < max_documents)
    {
        query.offset = offset + limit;
        return base_url + "?" + new URLSearchParams(query).toString();
    }
    else
        return null;
}

_exports.createPreviousUrl = (base_url, query, offset, limit, max_documents) => {
    if (offset > 0)
    {
        query.offset = Math.max(offset - limit, 0);
        return base_url + "?" + new URLSearchParams(query).toString();
    }
    else
        return null;
}

_exports.paginationQuery = async (Model, query, offset, limit, project = null) => {
    const total_data_aggregation = [
        { $match: query },
        { $skip: offset },
        { $limit: limit }
    ];
    if (project)
        total_data_aggregation.splice(1, 0, {$project: project});
    const response = await Model.aggregate([
        {
            $facet: {
                totalData: total_data_aggregation,
                totalCount: [
                    {
                        $group: {
                            _id: null,
                            count: { $sum: 1 }
                        }
                    }
                ]
            }
        }
    ]);
    return [response[0].totalData, response[0].totalCount[0].count];
}

module.exports =_exports;