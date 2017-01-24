import generator from 'mongoose-gen'
import semverRegex from 'semver-regex'

generator.setValidator('^([0-9A-Z]{10})$', (value) => {
    return /^([0-9A-Z]{10})$/.test(value)
})

generator.setValidator('^(AUG-AC[0-9]{2})|(02-01-001)$', (value) => {
    return /^(AUG-AC[0-9]{2})|(02-01-001)$/.test(value)
})

generator.setValidator('^(AUG-AB[0-9]{2})|(02-01-001)$', (value) => {
    return /^(AUG-AB[0-9]{2})|(02-01-001)$/.test(value)
})

generator.setValidator('mac address format', (value) => {
    return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(value)
})

generator.setValidator('ISO8601 date', (value) => {
    return true
})

generator.setValidator('^(D1[0-9A-Z]{8})$', (value) => {
    return /^(D1[0-9A-Z]{8})$/.test(value)
})

generator.setValidator('semver', (value) => {
    return semverRegex.test(value)
})

export default generator