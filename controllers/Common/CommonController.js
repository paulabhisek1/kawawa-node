/*!
 * CommonController.js
 * Containing all the controller actions related to `USER`
 * Author: Suman Rana
 * Date: 7th February, 2021`
 * MIT Licensed
 */
/**
* Module dependencies.
* @private
*/

// ################################ Repositories ################################ //
const countryRepository = require('../../repositories/CountriesRepository');

// ################################ Response Messages ################################ //
const responseMessages = require('../../ResponseMessages');

/*
|------------------------------------------------ 
| API name          :  fetchCountries
| Response          :  Respective response message in JSON format
| Logic             :  Fetch Countries
| Request URL       :  BASE_URL/api/countries
| Request method    :  GET
| Author            :  Suman Rana
|------------------------------------------------
*/
module.exports.fetchCountries = (req, res) => {
    (async()=>{
        let purpose = "Fetch Countries";
        try{
            let whereData = { is_active: { $in: [0,1] } };
            let countriesData = await countryRepository.findAll(whereData);

            return res.status(200).send({
                status: 200,
                msg: responseMessages.countryFetch,
                data: countriesData,
                purpose: purpose
            })
        }
        catch(e) {
            console.log("Fetch Countries Error : ",e);
            return res.status(500).send({
                status : 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose
            })
        }
    })()
}
