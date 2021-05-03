const sequelize = require('../config/dbConfig').sequelize;
var DataTypes = require('sequelize/lib/data-types');

const PodcastsModel = require('../models/podcasts')(sequelize, DataTypes);
const ArtistModel = require('../models/artists')(sequelize, DataTypes);
const CountryModel = require('../models/countries')(sequelize, DataTypes);
const PodcastCategoryModel = require('../models/podcast_categories')(sequelize, DataTypes);

PodcastsModel.belongsTo(ArtistModel, { foreignKey: 'artist_id', as: 'artist_details' });
PodcastsModel.belongsTo(CountryModel, { foreignKey: 'country_id', as: 'country_details' });
PodcastsModel.belongsTo(PodcastCategoryModel, { foreignKey: 'category_id', as: 'category_details' });


// Create
module.exports.create = (data, t = null) => {
    return new Promise((resolve, reject) => {
        let options = {}
        //if trunsaction exist
        if (t != null) options.transaction = t;
        PodcastsModel.create(data, options).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err);
        })
    })
}

module.exports.count = (where) => {
    return new Promise((resolve, reject) => {
        PodcastsModel.count({
            where: where,
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

module.exports.podcastDetails = (where) => {
    return new Promise((resolve, reject) => {
        PodcastsModel.findOne({
            where: where,
            include: [{
                    model: ArtistModel,
                    as: 'artist_details',
                    attributes: ['id', 'full_name', 'profile_image', 'type']
                },
                {
                    model: PodcastCategoryModel,
                    as: 'category_details',
                    attributes: ['id', 'name']
                },
                {
                    model: CountryModel,
                    as: 'country_details',
                }
            ],
        }).then(result => {
            result = JSON.parse(JSON.stringify(result).replace(/\:null/gi, "\:\"\""));
            resolve(result);
        }).catch((error) => {
            reject(error);
        })
    })
}

