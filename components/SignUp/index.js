import React from 'react'
import { StyleSheet, Text, TextInput, View, Button, Image, TouchableOpacity, ScrollView } from 'react-native'
import firebase from 'firebase'
import appStyles from '@/AppStyles'
import { LinearGradient } from 'expo'
import { Col, Row, Grid } from "react-native-easy-grid"

let icon = require('@/assets/images/Icon.png')
let logo = require('@/assets/images/ServLynk-2.png')

export default class SignUp extends React.Component {

  state = { email: '', password: '', errorMessage: null, agreementVisible: false,
    agreement: `End-User License Agreement ("Agreement")\n\n` +
      `Last updated: June 20, 2017\n\n` +
      `Please read this End-User License Agreement ("Agreement") carefully before clicking the "I Agree" button, downloading or using ServLynk ("Application").\n\n` +
      `By clicking the "I Agree" button, downloading or using the Application, you are agreeing to be bound by the terms and conditions of this Agreement.\n\n` +
      `This Agreement is a legal agreement between you (either an individual or a single entity) and ServLynk and it governs your use of the Application made available to you by ServLynk.\n\n` +
      `If you do not agree to the terms of this Agreement, do not click on the "I Agree" button and do not download or use the Application.\n\n` +
      `The Application is licensed, not sold, to you by ServLynk for use strictly in accordance with the terms of this Agreement.\n\n` +
      `License\n\n` +
      `ServLynk grants you a revocable, non-exclusive, non-transferable, limited license to download, install and use the Application solely for your personal, non-commercial purposes strictly in accordance with the terms of this Agreement.\n\n` +
      `Restrictions\n\n` +
      `You agree not to, and you will not permit others to:\n\n` +
      `license, sell, rent, lease, assign, distribute, transmit, host, outsource, disclose or otherwise commercially exploit the Application or make the Application available to any third party.\n\n` +
      `copy or use the Application for any purpose other than as permitted under the above section 'License'.\n\n` +
      `modify, make derivative works of, disassemble, decrypt, reverse compile or reverse engineer any part of the Application.\n\n` +
      `remove, alter or obscure any proprietary notice (including any notice of copyright or trademark) of ServLynk or its affiliates, partners, suppliers or the licensors of the Application.\n\n` +
      `Intellectual Property\n\n` +
      `The Application, including without limitation all copyrights, patents, trademarks, trade secrets and other intellectual property rights are, and shall remain, the sole and exclusive property of ServLynk.\n\n` +
      `Your Suggestions\n\n` +
      `Any feedback, comments, ideas, improvements or suggestions (collectively, "Suggestions") provided by you to ServLynk with respect to the Application shall remain the sole and exclusive property of ServLynk.\n\n` +
      `ServLynk shall be free to use, copy, modify, publish, or redistribute the Suggestions for any purpose and in any way without any credit or any compensation to you.\n\n` +
      `Modifications to Application\n\n` +
      `ServLynk reserves the right to modify, suspend or discontinue, temporarily or permanently, the Application or any service to which it connects, with or without notice and without liability to you.\n\n` +
      `Updates to Application\n\n` +
      `ServLynk may from time to time provide enhancements or improvements to the features/functionality of the Application, which may include patches, bug fixes, updates, upgrades and other modifications ("Updates").\n\n` +
      `Updates may modify or delete certain features and/or functionalities of the Application. You agree that ServLynk has no obligation to (i) provide any Updates, or (ii) continue to provide or enable any particular features and/or functionalities of the Application to you.\n\n` +
      `You further agree that all Updates will be (i) deemed to constitute an integral part of the Application, and (ii) subject to the terms and conditions of this Agreement.\n\n` +
      `Third-Party Services\n\n` +
      `The Application may display, include or make available third-party content (including data, information, applications and other products services) or provide links to third-party websites or services ("Third-Party Services").\n\n` +
      `You acknowledge and agree that ServLynk shall not be responsible for any Third-Party Services, including their accuracy, completeness, timeliness, validity, copyright compliance, legality, decency, quality or any other aspect thereof. ServLynk does not assume and shall not have any liability or responsibility to you or any other person or entity for any Third-Party Services.\n\n` +
      `Third-Party Services and links thereto are provided solely as a convenience to you and you access and use them entirely at your own risk and subject to such third parties' terms and conditions.\n\n` +
      `Privacy Policy\n\n` +
      `ServLynk collects, stores, maintains, and shares information about you in accordance with its Privacy Policy, which is available at ARC170620-9181-88206. By accepting this Agreement, you acknowledge that you hereby agree and consent to the terms and conditions of our Privacy Policy.\n\n` +
      `Term and Termination\n\n` +
      `This Agreement shall remain in effect until terminated by you or ServLynk.\n\n` +
      `ServLynk may, in its sole discretion, at any time and for any or no reason, suspend or terminate this Agreement with or without prior notice.\n\n` +
      `This Agreement will terminate immediately, without prior notice from ServLynk, in the event that you fail to comply with any provision of this Agreement. You may also terminate this Agreement by deleting the Application and all copies thereof from your mobile device or from your computer.\n\n` +
      `Upon termination of this Agreement, you shall cease all use of the Application and delete all copies of the Application from your mobile device or from your computer.\n\n` +
      `Termination of this Agreement will not limit any of ServLynk's rights or remedies at law or in equity in case of breach by you (during the term of this Agreement) of any of your obligations under the present Agreement.\n\n` +
      `Indemnification\n\n` +
      `You agree to indemnify and hold ServLynk and its parents, subsidiaries, affiliates, officers, employees, agents, partners and licensors (if any) harmless from any claim or demand, including reasonable attorneys' fees, due to or arising out of your: (a) use of the Application; (b) violation of this Agreement or any law or regulation; or (c) violation of any right of a third party.\n\n` +
      `No Warranties\n\n` +
      `The Application is provided to you "AS IS" and "AS AVAILABLE" and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, ServLynk, on its own behalf and on behalf of its affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to the Application, including all implied warranties of merchantability, fitness for a particular purpose, title and non-infringement, and warranties that may arise out of course of dealing, course of performance, usage or trade practice. Without limitation to the foregoing, ServLynk provides no warranty or undertaking, and makes no representation of any kind that the Application will meet your requirements, achieve any intended results, be compatible or work with any other software, applications, systems or services, operate without interruption, meet any performance or reliability standards or be error free or that any errors or defects can or will be corrected.\n\n` +
      `Without limiting the foregoing, neither ServLynk nor any ServLynk's provider makes any representation or warranty of any kind, express or implied: (i) as to the operation or availability of the Application, or the information, content, and materials or products included thereon; (ii) that the Application will be uninterrupted or error-free; (iii) as to the accuracy, reliability, or currency of any information or content provided through the Application; or (iv) that the Application, its servers, the content, or e-mails sent from or on behalf of ServLynk are free of viruses, scripts, trojan horses, worms, malware, timebombs or other harmful components.\n\n` +
      `Some jurisdictions do not allow the exclusion of or limitations on implied warranties or the limitations on the applicable statutory rights of a consumer, so some or all of the above exclusions and limitations may not apply to you.\n\n` +
      `Limitation of Liability\n\n` +
      `Notwithstanding any damages that you might incur, the entire liability of ServLynk and any of its suppliers under any provision of this Agreement and your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by you for the Application.\n\n` +
      `To the maximum extent permitted by applicable law, in no event shall ServLynk or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of profits, for loss of data or other information, for business interruption, for personal injury, for loss of privacy arising out of or in any way related to the use of or inability to use the Application, third-party software and/or third-party hardware used with the Application, or otherwise in connection with any provision of this Agreement), even if ServLynk or any supplier has been advised of the possibility of such damages and even if the remedy fails of its essential purpose.\n\n` +
      `Some states/jurisdictions do not allow the exclusion or limitation of incidental or consequential damages, so the above limitation or exclusion may not apply to you.\n\n` +
      `Severability\n\n` +
      `If any provision of this Agreement is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.\n\n` +
      `Waiver\n\n` +
      `Except as provided herein, the failure to exercise a right or to require performance of an obligation under this Agreement shall not effect a party's ability to exercise such right or require such performance at any time thereafter nor shall be the waiver of a breach constitute waiver of any subsequent breach.\n\n` +
      `For U.S. Government End Users\n\n` +
      `The Application and related documentation are "Commercial Items", as that term is defined under 48 C.F.R. §2.101, consisting of "Commercial Computer Software" and "Commercial Computer Software Documentation", as such terms are used under 48 C.F.R. §12.212 or 48 C.F.R. §227.7202, as applicable. In accordance with 48 C.F.R. §12.212 or 48 C.F.R. §227.7202-1 through 227.7202-4, as applicable, the Commercial Computer Software and Commercial Computer Software Documentation are being licensed to U.S. Government end users (a) only as Commercial Items and (b) with only those rights as are granted to all other end users pursuant to the terms and conditions herein.\n\n` +
      `Export Compliance\n\n` +
      `You may not export or re-export the Application except as authorized by United States law and the laws of the jurisdiction in which the Application was obtained.\n\n` +
      `In particular, but without limitation, the Application may not be exported or re-exported (a) into or to a nation or a resident of any U.S. embargoed countries or (b) to anyone on the U.S. Treasury Department's list of Specially Designated Nationals or the U.S. Department of Commerce Denied Person's List or Entity List.\n\n` +
      `By installing or using any component of the Application, you represent and warrant that you are not located in, under control of, or a national or resident of any such country or on any such list.\n\n` +
      `Amendments to this Agreement\n\n` +
      `ServLynk reserves the right, at its sole discretion, to modify or replace this Agreement at any time. If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.\n\n` +
      `By continuing to access or use our Application after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Application.\n\n` +
      `Governing Law\n\n` +
      `The laws of Ohio, United States, excluding its conflicts of law rules, shall govern this Agreement and your use of the Application. Your use of the Application may also be subject to other local, state, national, or international laws.\n\n` +
      `This Agreement shall not be governed by the United Nations Convention on Contracts for the International Sale of Good.\n\n` +
      `Contact Information\n\n` +
      `If you have any questions about this Agreement, please contact us.\n\n` +
      `Entire Agreement\n\n` +
      `The Agreement constitutes the entire agreement between you and ServLynk regarding your use of the Application and supersedes all prior and contemporaneous written or oral agreements between you and ServLynk.\n\n` +
      `You may be subject to additional terms and conditions that apply when you use or purchase other ServLynk's services, which ServLynk will provide to you at the time of such use or purchase.`
}

  handleSignUp = () => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => {
        this.addUserInfo();
        this.props.navigation.navigate('Profile');
      })
      .catch(error => this.setState({ errorMessage: error.message }))
  }

  addUserInfo() {
    let emailAddress = this.state.email;
    let password = this.state.password;

    let db = firebase.firestore();
    let user = firebase.auth().currentUser;   

    db.collection('users').where('userId', '==', user.uid)
      .get()
      .then((userDoc) => {
        db.collection('users').add({
          emailAddress,
          password,
          userId: user.uid
        });
      }, (error) => {

      });
  }

  getModalStyle() {
    if (this.state.agreementVisible) {
      return {
        display: 'flex'
      }
    }
  }

  goBack() {
    this.setState({ agreementVisible: false });
    this.props.navigation.goBack();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={logo}
            style={styles.logo}
          />
        </View>
        {this.state.errorMessage &&
          <Text style={{ color: 'red', position: 'relative', top: 70, width: 250 }}>
            {this.state.errorMessage}
          </Text>}

        <View style={styles.inputs}>
          <TextInput
            placeholder="Email"
            autoCapitalize="none"
            style={styles.textInput}
            onChangeText={email => this.setState({ email })}
            value={this.state.email}
            underlineColorAndroid='transparent'
          />
          <TextInput
            secureTextEntry
            placeholder="Password"
            autoCapitalize="none"
            style={styles.textInput}
            onChangeText={password => this.setState({ password })}
            value={this.state.password}
            underlineColorAndroid='transparent'
          />
        </View>

        <TouchableOpacity
          style={[styles.signup, appStyles.buttonContainer]}
          onPress={this.handleSignUp}
        >
          <LinearGradient
            start={{x: 0, y: 0.75}} end={{x: 1, y: 0.25}}
            colors={['#0428CA', '#0464F4']}
            style={{ padding: 15, alignItems: 'center', width: 200, borderRadius: 10 }}>
            <Text style={appStyles.buttonText}>Sign Up</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[styles.message, appStyles.regularText]} onPress={() => this.props.navigation.navigate('Login')}>
          Already have an account? Login
        </Text>
        <Text style={[styles.messageTwo, appStyles.regularText]} onPress={() => this.props.navigation.navigate('ForgotPassword')}>
          I've forgotten my password! Reset it
        </Text>

        <Grid style={styles.privacy}>
          <Row style={{width: 500}}>
            <Col style={{width:210}}>
              <Text style={[styles.messageThree, appStyles.regularText, {fontSize: 12}]}>
                By creating an account you agree to our
              </Text>
            </Col>
            <Col style={{position: 'relative', top: 0.5}}>
              <Text style={appStyles.boldText, {fontSize: 12, fontWeight: '600'}} onPress={() => this.setState({ agreementVisible: true })}>
                terms
              </Text>
            </Col>
          </Row>
        </Grid>

        {
          this.state.agreementVisible &&
            <ScrollView style={[styles.modal, this.getModalStyle()]}>
              <Text style={appStyles.regularText}>{this.state.agreement}</Text>
              <Button title={'I Agree'} onPress={() => this.setState({ agreementVisible: false })}/>
            </ScrollView>
        }

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  logoContainer: {
    position: 'absolute',
    top: 100,
    marginBottom: 40
  },
  logo: {
    width: 216,
    height: 48
  },
  textInput: {
    height: 40,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    marginTop: 20,
  },
  message: {
    paddingTop: 40
  },
  messageTwo: {
    paddingTop: 10
  },
  inputs: {
    width: 250,
    // marginLeft: '10%',
    marginTop: 208,
    marginBottom: 40
  },
  privacy: {
    left: 120,
    paddingTop: 80
  },
  modal: {
    display: 'none',
    width: '80%',
    height: '93%',
    position: 'absolute',
    top: 30,
    backgroundColor: '#fff'
  }
})
