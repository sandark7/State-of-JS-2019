import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Block from 'core/blocks/block/Block'
import { usePageContext } from 'core/helpers/pageContext'
import { useI18n } from 'core/i18n/i18nContext'
import ChartContainer from 'core/charts/ChartContainer'
import { featureExperience } from 'core/constants'
import GaugeBarChart from 'core/charts/generic/GaugeBarChart'
import FeatureResources from 'core/blocks/features/FeatureResources'
import get from 'lodash/get'

// convert relative links into absolute MDN links
const parseMDNLinks = content =>
    content.replace(new RegExp(`href="/`, 'g'), `href="https://developer.mozilla.org/`)

const FeatureExperienceBlock = ({ block, data, units: defaultUnits = 'percentage' }) => {
    // const { getName } = useEntities()

    const [units, setUnits] = useState(defaultUnits)

    const context = usePageContext()
    const { translate } = useI18n()
    const { name, mdn } = data

    let buckets = get(data, 'experience.year.buckets')

    const feature = {
        resources: {
            id: block.id
        }
    }

    const caniuseInfo = undefined

    // @todo: handle normalization directly in the survey
    buckets = buckets.map(bucket => {
        let id
        if (bucket.id === 'heard') {
            id = 'know_not_used'
        }
        if (bucket.id === 'neverheard') {
            id = 'never_heard_not_sure'
        }
        if (bucket.id === 'used') {
            id = 'used_it'
        }

        return {
            ...bucket,
            id
        }
    })

    const mdnLink = mdn && `https://developer.mozilla.org${mdn.url}`
    const description =
        mdn &&
        `${parseMDNLinks(mdn.summary)} <a href="${mdnLink}">${translate('feature.mdn_link')}</a>`

    return (
        <Block
            title={name}
            units={units}
            setUnits={setUnits}
            data={buckets}
            block={{ ...block, title: name, description }}
            showDescription={false}
        >
            <div className="Feature FTBlock">
                <div className="Feature__Chart FTBlock__Chart">
                    <ChartContainer height={40} fit={true} className="FeatureChart">
                        <GaugeBarChart
                            buckets={buckets}
                            colorMapping={featureExperience}
                            units={units}
                            applyEmptyPatternTo="never_heard_not_sure"
                            i18nNamespace="features.usage"
                        />
                    </ChartContainer>
                </div>
            </div>
        </Block>
    )
}

FeatureExperienceBlock.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired
    }).isRequired,
    data: PropTypes.shape({
        year: PropTypes.number.isRequired,
        completion: PropTypes.shape({
            count: PropTypes.number.isRequired,
            percentage: PropTypes.number.isRequired
        }).isRequired,
        buckets: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                usage: PropTypes.shape({
                    total: PropTypes.number.isRequired,
                    buckets: PropTypes.arrayOf(
                        PropTypes.shape({
                            id: PropTypes.string.isRequired,
                            count: PropTypes.number.isRequired,
                            percentage: PropTypes.number.isRequired
                        })
                    ).isRequired
                })
            })
        )
    }).isRequired
}

export default FeatureExperienceBlock
